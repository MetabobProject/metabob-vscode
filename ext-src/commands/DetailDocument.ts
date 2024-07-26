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
    const analyzeState = new Analyze(context);
    const analyzeStateValue = analyzeState.value();
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
    const fileProblems = copiedAnalyzeValue[args.path][0].problems;
    const problem = fileProblems.find(problem => problem.id === args.id);
    if (!problem) return;

    const readSuggestionPayload: FeedbackSuggestionPayload = {
      problemId: args.id,
      discarded: problem.discarded,
      endorsed: problem.endorsed,
    };

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

    await analyzeState.set(copiedAnalyzeValue);

    await Promise.allSettled([feedbackService.readSuggestion(readSuggestionPayload, sessionToken)]);
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
