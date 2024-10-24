import * as vscode from 'vscode';
import { Result } from 'rusty-result-ts';
import { submitService, SubmitRepresentationResponse, ApiErrorBase } from '../services/';
import { IDocumentMetaData } from '../types';
import { Analyze, ProblemData } from '../state';
import Util from '../utils';
import CONSTANTS from '../constants';
import { getExtensionEventEmitter } from '../events';
import path from 'path';

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
  context: vscode.ExtensionContext,
  jobId?: string,
  suppressRateLimitErrors = false,
  _debug?: vscode.OutputChannel,
) => {
  const thirty_minutes = new Date();
  thirty_minutes.setMinutes(thirty_minutes.getMinutes() + 30);

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
        name: currentWorkSpaceFolder,
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
      vscode.window.showErrorMessage(CONSTANTS.analyzeCommandTimeoutMessage);
    }
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });

    return failedResponseReturn;
  } else if (verifiedResponse.status === 'failed') {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  // If the response is pending or running, return verified response early
  if (verifiedResponse.status !== 'complete') {
    return verifiedResponse;
  }

  const currFile = Util.getCurrentFile();
  if (!currFile) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  // convert problem paths to absolute path and normalize them
  const workspaceFolderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceFolderPath) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });

    return failedResponseReturn;
  }
  verifiedResponse.results.forEach(result => {
    result.path = path.join(workspaceFolderPath, result.path);
  });

  const analyzeState = new Analyze(context);
  _debug?.appendLine(
    'AnalyzeDocument.ts: handleDocumentAnalyze: analyzeStateValue: ' +
      JSON.stringify(analyzeState.value()),
  );

  const results: ProblemData[] = verifiedResponse.results
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
        currFile.editor.document.lineAt(endLine - 1).text.length,
      );

      const text = currFile.editor.document.getText(range).replace('\n', '').replace('\t', '');
      if (text.length === 0 || text === '' || text === ' ') {
        return false;
      }

      return true;
    })
    .map(problem => {
      return {
        ...problem,
        isViewed: false,
      };
    });

  if (results.length !== 0) {
    analyzeState.storeAnalysis(metaDataDocument.filePath, {
      analyzedDocumentContent: metaDataDocument.fileContent,
      isValid: true,
      expiration: thirty_minutes.toISOString(),
      problems: results,
    });
  }
  _debug?.appendLine('AnalyzeDocument.ts: Document File path: ' + currFile.absPath);
  const problems = Util.getCurrentEditorProblems(analyzeState.value(), currFile.absPath);
  _debug?.appendLine(
    'AnalyzeDocument.ts: handleDocumentAnalyze: problems: ' + JSON.stringify(problems),
  );
  if (!problems) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  const paths = problems.map(item => item.path);

  const isUserOnValidEditor = paths.includes(currFile.absPath);
  _debug?.appendLine(
    'AnalyzeDocument.ts: handleDocumentAnalyze: isUserOnValidEditor: ' + isUserOnValidEditor,
  );
  if (isUserOnValidEditor) {
    Util.decorateCurrentEditorWithHighlights(problems, currFile.editor, _debug);
  }

  if (problems.length === 0) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Completed_Empty_Problems',
      data: {
        shouldResetRecomendation: true,
        shouldMoveToAnalyzePage: true,
      },
    });

    getExtensionEventEmitter().fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });

    return verifiedResponse;
  }

  getExtensionEventEmitter().fire({
    type: 'Analysis_Completed',
    data: {
      shouldResetRecomendation: true,
      shouldMoveToAnalyzePage: true,
    },
  });

  getExtensionEventEmitter().fire({
    type: 'CURRENT_PROJECT',
    data: {
      name: currentWorkSpaceFolder,
    },
  });

  return verifiedResponse;
};
