import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { Problem } from '../types';
import { CurrentQuestion } from '../state';
import { getExtensionEventEmitter } from '../events';

export type FixSuggestionCommandHandler = {
  path: string;
  id: string;
  vuln: Problem;
  jobId?: string;
};

export function activateFixSuggestionCommand(context: vscode.ExtensionContext): void {
  const command = CONSTANTS.fixSuggestionCommand;

  const commandHandler = async (args: FixSuggestionCommandHandler) => {
    const { path, id, vuln } = args;
    try {
      const currentQuestionState = new CurrentQuestion(context);
      await currentQuestionState.set({
        path,
        id,
        vuln,
        isFix: true,
        isReset: false,
      });
      getExtensionEventEmitter().fire({
        type: 'FIX_SUGGESTION',
        data: {
          path,
          id,
          vuln,
          isFix: true,
          isReset: false,
        },
      });
    } catch (error) {

    }

    vscode.commands.executeCommand('recommendation-panel-webview.focus');
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
