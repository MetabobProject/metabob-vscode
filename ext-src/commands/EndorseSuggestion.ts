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
    const { id: problemId, path } = args;
    const key = `${path}@@${problemId}`;

    const extensionEventEmitter = getExtensionEventEmitter();

    const analyzeState = new Analyze(context);
    const analyzeStateValue = analyzeState.get()?.value;
    if (!analyzeStateValue) return;

    const sessionToken = new Session(context).get()?.value;
    if (!sessionToken) return;

    const copyProblems = { ...analyzeStateValue };

    copyProblems[key].isDiscarded = false;
    copyProblems[key].isEndorsed = true;
    copyProblems[key].isViewed = true

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: false,
      endorsed: true,
    };
    try {
      await feedbackService.endorseSuggestion(payload, sessionToken);
      await feedbackService.readSuggestion(payload, sessionToken);
      await analyzeState.set(copyProblems)
      extensionEventEmitter.fire({
        type: 'Analysis_Completed',
        data: { shouldResetRecomendation: false, shouldMoveToAnalyzePage: false, ...copyProblems }
      })
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
