import * as vscode from 'vscode';
import { CurrentQuestion } from '../state';

export function initState(context: vscode.ExtensionContext): void {
  const currentQuestionState = new CurrentQuestion(context);
  currentQuestionState.clear();
}
