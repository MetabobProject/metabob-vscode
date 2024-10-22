import * as vscode from 'vscode';
import { CurrentQuestion, Recommendations } from '../state';

export function initState(context: vscode.ExtensionContext): void {
  const currentQuestionState = new CurrentQuestion(context);
  currentQuestionState.clear();

  const recommendationState = new Recommendations(context);
  recommendationState.clear();
}
