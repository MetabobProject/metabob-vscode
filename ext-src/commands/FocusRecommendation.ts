import * as vscode from 'vscode';
import { Problem } from '../types';
import { getExtensionEventEmitter } from '../events';
import { Analyze } from '../state';

type FocusCommandHandler = { path: string; id: string; vuln: Problem; jobId: string };
export function activateFocusRecommendCommand(context: vscode.ExtensionContext): void {
  const command = 'metabob.focusRecommend';

  const commandHandler = async (args: FocusCommandHandler) => {
    const { id, vuln, path } = args;
    const key = `${path}@@${id}`;

    const analyzeState = new Analyze(context);
    const analyzeStateValue = analyzeState.get()?.value;
    if (!analyzeStateValue) return;

    const copyProblems = { ...analyzeStateValue };

    copyProblems[key].isDiscarded = false;
    copyProblems[key].isEndorsed = false;
    copyProblems[key].isViewed = true;

    await analyzeState.set({ ...copyProblems });
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
