import * as vscode from 'vscode';
import { Analyze, Session } from '../state';
import { SubmitRepresentationResponse } from '../services';
import { IAnalyzeTextDocumentOnSave } from '../types';
import Util from '../utils';
import { handleDocumentAnalyze } from './HandleDocumentAnalyze';
import CONSTANTS from '../constants';

export async function AnalyzeDocumentOnSave(
  _payload: IAnalyzeTextDocumentOnSave,
  context: vscode.ExtensionContext,
): Promise<void> {
  const sessionToken = new Session(context).get()?.value;
  if (!sessionToken) return;

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const documentMetaData = Util.extractMetaDataFromDocument(editor.document);

  const analyzeState = new Analyze(context);
  let isInQueue = false;

  const jobId = await Util.withProgress<SubmitRepresentationResponse>(
    handleDocumentAnalyze(documentMetaData, sessionToken, analyzeState, undefined, true),
    CONSTANTS.analyzeCommandProgressMessage,
  ).then(response => {
    if (response.status === 'pending' || response.status === 'running') {
      isInQueue = true;

      return response.jobId;
    }

    return;
  });

  if (isInQueue) {
    Util.withProgress<SubmitRepresentationResponse>(
      handleDocumentAnalyze(documentMetaData, sessionToken, analyzeState, jobId, true),
      CONSTANTS.analyzeCommandQueueMessage,
    ).then(response => {
      if (response.status === 'complete' || response.status === 'failed') {
        isInQueue = false;
      } else {
        isInQueue = true;
      }
    });
  }
}
