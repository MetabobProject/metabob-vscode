import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { feedbackService, FeedbackSuggestionPayload } from '../services';
import { Analyze, Session } from '../state';
import { getExtensionEventEmitter } from '../events';

export type EndorseCommandHandler = { id: string; path: string };

export function activateEndorseCommand(
  context: vscode.ExtensionContext,
  _debug?: vscode.OutputChannel,
): void {
  const command = CONSTANTS.endorseSuggestionCommand;

  const commandHandler = async (args: EndorseCommandHandler) => {
    const { id: problemId } = args;

    const extensionEventEmitter = getExtensionEventEmitter();

    const analyzeState = new Analyze(context);

    const sessionToken = new Session(context).get()?.value;
    if (!sessionToken) return;

    analyzeState.updateProblem(problemId, { discarded: false, endorsed: true, isViewed: true });

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: false,
      endorsed: true,
    };
    try {
      await feedbackService.endorseSuggestion(payload, sessionToken);
      await feedbackService.readSuggestion(payload, sessionToken);
      extensionEventEmitter.fire({
        type: 'Analysis_Completed',
        data: {
          shouldResetRecomendation: false,
          shouldMoveToAnalyzePage: false,
        },
      });
    } catch {
      _debug?.appendLine(`Metabob: Error Endorsing Problem With ${args.id}`);
      vscode.window.showErrorMessage(CONSTANTS.endorseCommandErrorMessage);

      return;
    }
    _debug?.appendLine(`Metabob: Endorsed Problem With ${args.id}`);
    vscode.window.showInformationMessage(CONSTANTS.endorseCommandSuccessMessage);
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
