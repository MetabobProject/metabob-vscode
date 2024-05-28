import * as vscode from 'vscode';
import { Result } from 'rusty-result-ts';
import { submitService, SubmitRepresentationResponse, ApiErrorBase } from '../services/';
import { IDocumentMetaData } from '../types';
import { AnalyzeState, Analyze, AnalyseMetaData } from '../state';
import Util from '../utils';
import CONSTANTS from '../constants';
import { getExtensionEventEmitter } from '../events';

const failedResponseReturn: SubmitRepresentationResponse = { jobId: '', status: 'failed' };

export const verifyResponseOfSubmit = (
  response: Result<SubmitRepresentationResponse | null, ApiErrorBase>,
) => {
  if (response.isErr()) {
    return undefined;
  }

  if (response.isOk()) {
    return response.value !== null ? response.value : undefined;
  }

  return undefined;
};

export const handleDocumentAnalyze = async (
  metaDataDocument: IDocumentMetaData,
  sessionToken: string,
  analyzeState: Analyze,
  context: vscode.ExtensionContext,
  jobId?: string,
  suppressRateLimitErrors = false,
  _debug?: vscode.OutputChannel,
) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const currentWorkSpaceFolder = Util.getRootFolderName();
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.fileName !== metaDataDocument.filePath) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });

    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder
      },
    });

    return failedResponseReturn;
  }

  const response =
    jobId !== undefined
      ? await submitService.getJobStatus(sessionToken, jobId)
      : await submitService.submitTextFile(
        metaDataDocument.relativePath,
        metaDataDocument.fileContent,
        metaDataDocument.filePath,
        sessionToken,
      );

  const verifiedResponse = verifyResponseOfSubmit(response);
  if (!verifiedResponse || !verifiedResponse.results) {
    if (!suppressRateLimitErrors) {
      getExtensionEventEmitter().fire({
        type: 'Analysis_Error',
        data: '',
      });
      getExtensionEventEmitter().fire({
        type: 'CURRENT_PROJECT',
        data: {
          name: currentWorkSpaceFolder
        },
      });
      vscode.window.showErrorMessage(CONSTANTS.analyzeCommandTimeoutMessage);
    }

    return failedResponseReturn;
  } else if (verifiedResponse.status === 'failed') {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder
      },
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  // If the response is pending or running, return verified response early
  if (verifiedResponse.status !== 'complete') {
    return verifiedResponse;
  }

  const documentMetaData = Util.getFileNameFromCurrentEditor();
  if (!documentMetaData) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder
      },
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  let results: AnalyzeState = {};
  const analyzeStateValue = new Analyze(context).get()?.value;
  _debug?.appendLine('AnalyzeDocument.ts: handleDocumentAnalyze: analyzeStateValue: ' + JSON.stringify(analyzeStateValue));

  if (analyzeStateValue) {
    const aggregatedProblemsFilePaths = verifiedResponse.results.map(problem => {
      return problem.path;
    });

    const buggerAnalyzeStateValue: AnalyzeState = {};

    Object.keys(analyzeStateValue).forEach(key => {
      const problem = analyzeStateValue[key];
      if (!aggregatedProblemsFilePaths.includes(problem.path)) {
        buggerAnalyzeStateValue[key] = { ...problem };
      }
    });
    results = { ...buggerAnalyzeStateValue };
  }

  verifiedResponse.results
    .filter(vulnerability => {
      const { endLine, startLine } = vulnerability;
      if (endLine - 1 < 0 || startLine - 1 < 0) {
        return false;
      }

      return true;
    })
    .filter(vulnerability => {
      const { endLine, startLine } = vulnerability;
      const range = new vscode.Range(
        startLine - 1,
        0,
        endLine - 1,
        documentMetaData.editor.document.lineAt(endLine - 1).text.length,
      );

      const text = documentMetaData.editor.document
        .getText(range)
        .replace('\n', '')
        .replace('\t', '');
      if (text.length === 0 || text === '' || text === ' ') {
        return false;
      }

      return true;
    })
    .forEach(problem => {
      const key = `${problem.path}@@${problem.id}`;
      const analyzeMetaData: AnalyseMetaData = {
        ...problem,
        startLine: problem.startLine < 0 ? problem.startLine * -1 : problem.startLine,
        endLine: problem.endLine < 0 ? problem.endLine * -1 : problem.endLine,
        isDiscarded: problem.discarded,
        isEndorsed: problem.endorsed,
        isViewed: false,
        fullFilePath: currentWorkSpaceFolder,
        expiration: tomorrow.toISOString(),
      };
      results[key] = { ...analyzeMetaData };
    });

  _debug?.appendLine('AnalyzeDocument.ts: Document File name' + documentMetaData.fileName);
  const problems = Util.getCurrentEditorProblems(results, documentMetaData.fileName);
  _debug?.appendLine('AnalyzeDocument.ts: handleDocumentAnalyze: problems: ' + JSON.stringify(problems));
  if (!problems) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder
      },
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  const paths = problems.map(item => item.path);

  const isUserOnValidEditor = paths.includes(documentMetaData.fileName);
  _debug?.appendLine('AnalyzeDocument.ts: handleDocumentAnalyze: isUserOnValidEditor: ' + isUserOnValidEditor);
  if (isUserOnValidEditor) {
    Util.decorateCurrentEditorWithHighlights(problems, documentMetaData.editor, _debug);
  }

  await analyzeState.set(results);

  if (problems.length === 0) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Completed_Empty_Problems',
      data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...results },
    });

    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder
      },
    });

    return verifiedResponse
  }


  getExtensionEventEmitter().fire({
    type: 'Analysis_Completed',
    data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...results },
  });

  getExtensionEventEmitter().fire({
    type: 'CURRENT_PROJECT',
    data: {
      name: currentWorkSpaceFolder
    },
  });

  return verifiedResponse;
};
