import * as vscode from 'vscode';
import { CurrentQuestion, Analyze, Session } from '../state';
import { FeedbackSuggestionPayload, feedbackService } from '../services';
import { getExtensionEventEmitter } from '../events';
import CONSTANTS from '../constants';
import Utils from '../utils';

export type DiscardCommandHandler = { id: string; path: string };

export function activateDiscardCommand(context: vscode.ExtensionContext): void {
  const command = CONSTANTS.discardSuggestionCommand;

  const commandHandler = async (args: DiscardCommandHandler) => {
    const currentWorkSpaceFolder = Utils.getRootFolderName();
    const analyzeState = new Analyze(context);
    const currentQuestion = new CurrentQuestion(context);
    const extensionEventEmitter = getExtensionEventEmitter();
    const { id: problemId, path } = args;

    const session = new Session(context).get()?.value;
    if (!session) {
      vscode.window.showErrorMessage(CONSTANTS.discardCommandErrorMessage);

      return;
    }

    // verifying that in-fact user viewing problem.path file.
    const documentMetaData = Utils.getCurrentFile();
    if (!documentMetaData) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError);

      return;
    }

    const filename: string | undefined = documentMetaData.absPath;
    const isUserOnProblemFile: boolean = filename === path;

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: true,
      endorsed: false,
    };

    // Updating the state with discarded problem values.
    analyzeState.updateProblem(problemId, { discarded: true, endorsed: false, isViewed: true });

    if (isUserOnProblemFile) {
      Utils.decorateCurrentEditorWithHighlights(
        analyzeState.getFileProblems(path),
        documentMetaData.editor,
      );
    }

    extensionEventEmitter.fire({
      type: 'onDiscardSuggestionClicked:Success',
      data: {},
    });

    extensionEventEmitter.fire({
      type: 'Analysis_Completed',
      data: {
        shouldResetRecomendation: true,
        shouldMoveToAnalyzePage: true,
      },
    });

    extensionEventEmitter.fire({
      type: 'CURRENT_FILE',
      data: { ...documentMetaData.editor.document },
    });

    extensionEventEmitter.fire({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });

    await Promise.allSettled([
      feedbackService.discardSuggestion(payload, session),
      feedbackService.readSuggestion(payload, session),
    ]);

    currentQuestion.clear();
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
