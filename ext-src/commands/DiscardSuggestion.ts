import * as vscode from 'vscode';
import { CurrentQuestion, Analyze, Session, AnalyseMetaData } from '../state';
import { GenerateDecorations } from '../helpers/GenerateDecorations';
import { FeedbackSuggestionPayload, feedbackService } from '../services';
import CONSTANTS from '../constants';
import Utils from '../utils';
import _debug from '../debug';

export type DiscardCommandHandler = { id: string; path: string };

export function activateDiscardCommand(context: vscode.ExtensionContext): void {
  const command = CONSTANTS.discardSuggestionCommand;

  const commandHandler = async (args: DiscardCommandHandler) => {
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

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: true,
      endorsed: false,
    };

    try {
      await feedbackService.discardSuggestion(payload, session);
    } catch (err: any) {
      _debug?.appendLine(err.message);
    }

    problems[key] = {
      ...problems[key],
      isDiscarded: true,
    };

    try {
      await analyzeState.set(problems);
    } catch (error: any) {
      _debug.appendLine(error);

      return;
    }

    const analyzeValue = analyzeState.get()?.value;

    if (!analyzeValue) {
      _debug?.appendLine('Metabob: analyzeValue is undefined in Discard Suggestion');

      return;
    }

    // Map all non discarded problems to the results array
    const results: AnalyseMetaData[] = Object.keys(analyzeValue)
      .filter(localKey => !analyzeValue[key].isDiscarded || localKey === key)
      .map(key => analyzeValue[key]);

    const decorations = GenerateDecorations(results, editor);
    editor.setDecorations(decorations.decorationType, []);
    editor.setDecorations(decorations.decorationType, decorations.decorations);
    currentQuestion.clear();

    // TODO: Send current question update to webview

    return;
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
