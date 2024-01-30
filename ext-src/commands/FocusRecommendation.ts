import * as vscode from 'vscode';
import { CurrentQuestion } from '../state/CurrentQuestion';
import { Problem } from '../types';
import CONSTANTS from '../constants';
import _debug from '../debug';
import { RecommendationWebView } from '../providers/recommendation.provider';

type FocusCommandHandler = { path: string; id: string; vuln: Problem; jobId: string };
export function activateFocusRecommendCommand(context: vscode.ExtensionContext): void {
  const command = 'metabob.focusRecommend';

  const commandHandler = async (args: FocusCommandHandler) => {
    const { id, vuln, path } = args;
    _debug?.appendLine(`Current Detection Set for ${path} with Problem ${id} `);

    const currentQuestionState = new CurrentQuestion(context);
    const currentQuestion = currentQuestionState.get()?.value;
    if (!currentQuestion) return;
    const webview = context.globalState.get<RecommendationWebView>(CONSTANTS.webview);
    if (!webview || !webview.postInitData) return;

    currentQuestionState.set({
      path,
      id,
      vuln,
      isFix: false,
      isReset: true,
    });

    vscode.commands.executeCommand('recommendation-panel-webview.focus');
    webview.postInitData(currentQuestion);
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
