import * as vscode from 'vscode';
import { Session } from '../state';
import { SubmitRepresentationResponse } from '../services';
import { IAnalyzeTextDocumentOnSave } from '../types';
import Util from '../utils';
import { handleDocumentAnalyze } from './HandleDocumentAnalyze';
import CONSTANTS from '../constants';
import { getExtensionEventEmitter } from '../events';

export async function AnalyzeDocumentOnSave(
  _payload: IAnalyzeTextDocumentOnSave,
  context: vscode.ExtensionContext,
): Promise<void> {
  const sessionToken = new Session(context).get()?.value;
  const extensionEventEmitter = getExtensionEventEmitter();

  if (!sessionToken) {
    extensionEventEmitter.fire({
      type: 'Analysis_Error',
      data: 'Editor is undefined',
    });

    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    extensionEventEmitter.fire({
      type: 'Analysis_Error',
      data: 'Editor is undefined',
    });

    return;
  }

  const documentMetaData = Util.extractMetaDataFromDocument(editor.document);

  let isInQueue = false;

  const jobId = await Util.withProgress<SubmitRepresentationResponse>(
    handleDocumentAnalyze(documentMetaData, sessionToken, context, undefined, true),
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
      handleDocumentAnalyze(documentMetaData, sessionToken, context, jobId, true),
      CONSTANTS.analyzeCommandQueueMessage,
    ).then(response => {
      if (response.status === 'complete' || response.status === 'failed') {
        isInQueue = false;
      } else {
        extensionEventEmitter.fire({
          type: 'Analysis_Error',
          data: 'Editor is undefined',
        });
        isInQueue = true;
      }
    });
  } else {
    extensionEventEmitter.fire({
      type: 'Analysis_Error',
      data: 'Editor is undefined',
    });
  }
}
