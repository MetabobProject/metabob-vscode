import * as vscode from 'vscode';
import { CurrentQuestion, Analyze, Session, AnalyseMetaData } from '../state';
import { GenerateDecorations, decorationType } from '../helpers/GenerateDecorations';
import { FeedbackSuggestionPayload, feedbackService } from '../services';
import { getExtensionEventEmitter } from '../events';
import CONSTANTS from '../constants';
import Utils from '../utils';
import { Problem } from '../types';
import _debug from '../debug';

export type DiscardCommandHandler = { id: string; path: string };

export function activateDiscardCommand(context: vscode.ExtensionContext): void {
  const command = CONSTANTS.discardSuggestionCommand;

  const commandHandler = async (args: DiscardCommandHandler) => {
    const extensionEventEmitter = getExtensionEventEmitter();
    const { id: problemId, path } = args;
    const key = `${path}@@${problemId}`;

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError);

      return;
    }

    if (!Utils.isValidDocument(editor.document)) {
      _debug?.appendLine(CONSTANTS.editorSelectedIsInvalid);

      return;
    }

    const session = new Session(context).get()?.value;
    if (!session) {
      _debug?.appendLine('Metabob: Session is undefined in Discard Suggestion');

      return;
    }

    const analyzeState = new Analyze(context);
    const currentQuestion = new CurrentQuestion(context);

    const problems = analyzeState.get()?.value;
    if (!problems) {
      _debug?.appendLine('Metabob: Problems is undefined in Discard Suggestion');

      return;
    }

    const copyProblems = { ...problems };

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: true,
      endorsed: false,
    };

    try {
      await feedbackService.discardSuggestion(payload, session);
      await feedbackService.readSuggestion(payload, session);
    } catch (err: any) {
      _debug?.appendLine(err.message);
    }

    copyProblems[key].isDiscarded = true;
    copyProblems[key].isEndorsed = false;
    copyProblems[key].isViewed = true

    try {
      analyzeState.set(copyProblems).then(() => {
        const results: Problem[] = [];

        for (const [, value] of Object.entries(copyProblems)) {
          const problem: Problem = {
            ...value,
            discarded: value.isDiscarded || false,
            endorsed: value.isEndorsed || false
          };

          if (!value.isDiscarded) {
            results.push(problem);
          }
        }

        const { decorations } = GenerateDecorations(results, editor);
        editor.setDecorations(decorationType, []);
        editor.setDecorations(decorationType, decorations);
        currentQuestion.clear();

        extensionEventEmitter.fire({
          type: 'onDiscardSuggestionClicked:Success',
          data: {},
        });
        extensionEventEmitter.fire({
          type: 'Analysis_Completed',
          data: copyProblems,
        });
        return;
      });
    } catch (error: any) {
      _debug.appendLine(error);

      return;
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
