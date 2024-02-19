import * as vscode from 'vscode';
import { CurrentQuestion, Analyze, Session } from '../state';
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
    const analyzeState = new Analyze(context);
    const problems = analyzeState.get()?.value;

    if (!problems) {
      _debug?.appendLine('Metabob: Problems is undefined in Discard Suggestion');
      vscode.window.showErrorMessage(CONSTANTS.discardCommandErrorMessage);
      return;
    }

    const currentQuestion = new CurrentQuestion(context);
    const extensionEventEmitter = getExtensionEventEmitter();
    const { id: problemId, path } = args;
    const key = `${path}@@${problemId}`;

    const session = new Session(context).get()?.value;
    if (!session) {
      _debug?.appendLine('Metabob: Session is undefined in Discard Suggestion');
      vscode.window.showErrorMessage(CONSTANTS.discardCommandErrorMessage);
      return;
    }

    // verifying that in-fact user viewing problem.path file.
    const documentMetaData = Utils.getFileNameFromCurrentEditor();
    if (!documentMetaData) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError);
      return;
    }

    const filename: string | undefined = documentMetaData.fileName;
    const isUserOnProblemFile: boolean = filename === path;

    const copyProblems = { ...problems };

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: true,
      endorsed: false,
    };

    // Updating the state with discarded problem values.
    copyProblems[key].isDiscarded = true;
    copyProblems[key].isEndorsed = false;
    copyProblems[key].isViewed = true;

    // Filtering the problem that are not not supported by vscode. Line range should be in range [0, lineNumber].
    const results: Problem[] | undefined = Utils.getCurrentEditorProblems(copyProblems, path);
    if (!results) {
      vscode.window.showErrorMessage(CONSTANTS.discardCommandErrorMessage);
      return;
    }

    const isDecorationsApplied = Utils.decorateCurrentEditorWithHighlights(
      results,
      documentMetaData.editor,
    );

    if (isUserOnProblemFile && isDecorationsApplied) {
      extensionEventEmitter.fire({
        type: 'onDiscardSuggestionClicked:Success',
        data: {},
      });

      getExtensionEventEmitter().fire({
        type: 'Analysis_Completed',
        data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...copyProblems },
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...documentMetaData.editor.document },
      });
    }

    await Promise.allSettled([
      analyzeState.set(copyProblems),
      feedbackService.discardSuggestion(payload, session),
      feedbackService.readSuggestion(payload, session),
    ]);

    currentQuestion.clear();
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
