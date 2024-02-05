import * as vscode from 'vscode';
import { CurrentQuestion } from '../state/CurrentQuestion';
import { Problem } from '../types';
import _debug from '../debug';
import { getExtensionEventEmitter } from '../events';

type FocusCommandHandler = { path: string; id: string; vuln: Problem; jobId: string };
export function activateFocusRecommendCommand(context: vscode.ExtensionContext): void {
  const command = 'metabob.focusRecommend';

  const commandHandler = async (args: FocusCommandHandler) => {
    const { id, vuln, path } = args;
    _debug?.appendLine(`Current Detection Set for ${path} with Problem ${id} `);

    const currentQuestionState = new CurrentQuestion(context);
    const currentQuestion = currentQuestionState.get()?.value;
    if (!currentQuestion) return;

    currentQuestionState.set({
      path,
      id,
      vuln,
      isFix: false,
      isReset: true,
    });

    getExtensionEventEmitter().fire({
      type: 'FIX_SUGGESTION',
      data: {
        path,
        id,
        vuln,
        isFix: false,
        isReset: true,
      },
    });

    vscode.commands.executeCommand('recommendation-panel-webview.focus');
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
