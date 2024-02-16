import * as vscode from 'vscode';
import { CurrentQuestion, Analyze, Session } from '../state';
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

    copyProblems[key].isDiscarded = true;
    copyProblems[key].isEndorsed = false;
    copyProblems[key].isViewed = true;
    try {
      await analyzeState.set(copyProblems);
      const results: Problem[] = [];
      for (const [, value] of Object.entries(copyProblems)) {
        const problem: Problem = {
          ...value,
          startLine: value.startLine < 0 ? value.startLine * -1 : value.startLine,
          endLine: value.endLine < 0 ? value.endLine * -1 : value.endLine,
          discarded: value.isDiscarded || false,
          endorsed: value.isEndorsed || false,
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
      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...editor.document },
      });
      await Promise.all([
        feedbackService.discardSuggestion(payload, session),
        feedbackService.readSuggestion(payload, session),
      ]);
    } catch (error: any) {
      _debug.appendLine(error);
      vscode.window.showErrorMessage(CONSTANTS.discardCommandErrorMessage);
      return;
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
