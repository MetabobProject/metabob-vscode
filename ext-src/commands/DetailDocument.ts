import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { Analyze, Session } from '../state';
import { Problem } from '../types';
import { getExtensionEventEmitter } from '../events';
import { FeedbackSuggestionPayload, feedbackService } from '../services';
import Utils from '../utils';

export function activateDetailSuggestionCommand(context: vscode.ExtensionContext): void {
  const command = CONSTANTS.showDetailSuggestionCommand;

  const commandHandler = async (args: {
    path: string;
    id: string;
    vuln: Problem;
    jobId: string;
  }) => {
    const currentWorkSpaceFolder = Utils.getRootFolderName();
    const key = `${args.path}@@${args.id}`;
    const setAnalyzeState = new Analyze(context);
    const analyzeStateValue = new Analyze(context).get()?.value;
    const sessionToken = new Session(context).get()?.value;
    const extensionEventEmitter = getExtensionEventEmitter();

    const documentMetaData = Utils.getCurrentFile();

    if (!documentMetaData) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError);
      return;
    }

    if (!sessionToken || !analyzeStateValue) {
      getExtensionEventEmitter().fire({
        type: 'CURRENT_PROJECT',
        data: {
          name: currentWorkSpaceFolder,
        },
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...documentMetaData.editor.document },
      });
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError);
      return;
    }

    vscode.commands.executeCommand('recommendation-panel-webview.focus');

    const copiedAnalyzeValue = { ...analyzeStateValue };
    copiedAnalyzeValue[key].isDiscarded = copiedAnalyzeValue[key].isDiscarded || false;
    copiedAnalyzeValue[key].isEndorsed = copiedAnalyzeValue[key].isEndorsed || false;
    copiedAnalyzeValue[key].isViewed = true;

    const readSuggestionPayload: FeedbackSuggestionPayload = {
      problemId: args.id,
      discarded: copiedAnalyzeValue[key].isDiscarded || false,
      endorsed: copiedAnalyzeValue[key].isEndorsed || false,
    };

    setTimeout(() => {
      getExtensionEventEmitter().fire({
        type: 'FIX_SUGGESTION',
        data: {
          path: args.path,
          id: args.id,
          vuln: args.vuln,
          isFix: false,
          isReset: false,
        },
      });

      getExtensionEventEmitter().fire({
        type: 'Analysis_Completed',
        data: {
          shouldResetRecomendation: false,
          shouldMoveToAnalyzePage: false,
          ...copiedAnalyzeValue,
        },
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...documentMetaData.editor.document },
      });

      getExtensionEventEmitter().fire({
        type: 'CURRENT_PROJECT',
        data: {
          name: currentWorkSpaceFolder,
        },
      });
    }, 500);

    await setAnalyzeState.set(copiedAnalyzeValue);

    await Promise.allSettled([feedbackService.readSuggestion(readSuggestionPayload, sessionToken)]);
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
