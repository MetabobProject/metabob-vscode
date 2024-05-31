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

export function activateFixSuggestionCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel ): void {
  const command = CONSTANTS.fixSuggestionCommand;
  
  const commandHandler = async (args: FixSuggestionCommandHandler) => {
    const { path, id, vuln } = args;
    _debug?.appendLine('FixSuggestion.ts: activateFixSuggestionCommand: started the command');
    try {
      const currentQuestionState = new CurrentQuestion(context);
      await currentQuestionState.set({
        path,
        id,
        vuln,
        isFix: true,
        isReset: false,
      });
      _debug?.appendLine('FixSuggestion.ts: activateFixSuggestionCommand: Inside the Try block');
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
      const errorMessage = (error as Error).message || 'Unknown';
      _debug?.appendLine('FixSuggestion.ts: activateFixSuggestionCommand: command: ' + errorMessage);}
    vscode.commands.executeCommand('recommendation-panel-webview.focus');
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
