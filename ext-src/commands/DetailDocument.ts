import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import _debug from '../debug';
import { Analyze, CurrentQuestion, CurrentQuestionState, Session } from '../state';
import { Problem } from '../types';
import { getExtensionEventEmitter } from '../events';
import { FeedbackSuggestionPayload, feedbackService } from '../services';

export function activateDetailSuggestionCommand(context: vscode.ExtensionContext): void {
  const command = CONSTANTS.showDetailSuggestionCommand;

  const commandHandler = async (args: {
    path: string;
    id: string;
    vuln: Problem;
    jobId: string;
  }) => {
    _debug.appendLine(`Detail initiated for ${args.path} with Problem ${args.id} `);
    vscode.commands.executeCommand('recommendation-panel-webview.focus');
    const key = `${args.path}@@${args.id}`;
    const setAnalyzeState = new Analyze(context);
    const analyzeStateValue = new Analyze(context).get()?.value;
    const sessionToken = new Session(context).get()?.value;
    const extensionEventEmitter = getExtensionEventEmitter();

    if (!sessionToken) {
      return
    }

    if (!analyzeStateValue) {
      return;
    }

    const copiedAnalyzeValue = { ...analyzeStateValue };

    copiedAnalyzeValue[key].isViewed = true;

    const readSuggestionPayload: FeedbackSuggestionPayload = {
      problemId: args.id,
      discarded: copiedAnalyzeValue[key].isDiscarded || false,
      endorsed: copiedAnalyzeValue[key].isEndorsed || false
    };

    await feedbackService.readSuggestion(readSuggestionPayload, sessionToken);


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

      extensionEventEmitter.fire({
        type: "Analysis_Completed",
        data: copiedAnalyzeValue
      })
    }, 500);

    const currentQuestionState = new CurrentQuestion(context);
    const payload: CurrentQuestionState = {
      path: args.path,
      id: args.id,
      vuln: args.vuln,
      isFix: false,
      isReset: false,
    };

    await setAnalyzeState.set(copiedAnalyzeValue);
    await currentQuestionState.set(payload);
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
