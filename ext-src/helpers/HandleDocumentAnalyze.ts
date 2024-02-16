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
) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.fileName !== metaDataDocument.filePath) {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
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
      vscode.window.showErrorMessage(CONSTANTS.analyzeCommandTimeoutMessage);
    }

    return failedResponseReturn;
  } else if (verifiedResponse.status === 'failed') {
    getExtensionEventEmitter().fire({
      type: 'Analysis_Error',
      data: '',
    });
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage);

    return failedResponseReturn;
  }

  // If the response is pending or running, return verified response early
  if (verifiedResponse.status !== 'complete') {
    return verifiedResponse;
  }

  let results: AnalyzeState = {};
  const analyzeStateValue = new Analyze(context).get()?.value;

  if (analyzeStateValue) {
    const aggregatedProblemsFilePaths = verifiedResponse.results.map(problem => {
      return problem.path;
    });

    let buggerAnalyzeStateValue: AnalyzeState = {};

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
    .forEach(problem => {
      const key = `${problem.path}@@${problem.id}`;
      const analyzeMetaData: AnalyseMetaData = {
        ...problem,
        startLine: problem.startLine < 0 ? problem.startLine * -1 : problem.startLine,
        endLine: problem.endLine < 0 ? problem.endLine * -1 : problem.endLine,
        isDiscarded: problem.discarded,
        isEndorsed: problem.endorsed,
        isViewed: false,
      };
      results[key] = { ...analyzeMetaData };
    });

  analyzeState.set(results);

  const decorationFromResponse = Util.transformResponseToDecorations(
    verifiedResponse.results,
    editor,
    jobId,
  );
  editor.setDecorations(decorationFromResponse.decorationType, []);
  editor.setDecorations(decorationFromResponse.decorationType, decorationFromResponse.decorations);

  getExtensionEventEmitter().fire({
    type: 'Analysis_Completed',
    data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...results },
  });

  return verifiedResponse;
};
