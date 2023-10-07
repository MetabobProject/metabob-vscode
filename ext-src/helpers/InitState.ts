import * as vscode from 'vscode'
import { currentQuestionState } from '../state/CurrentQuestion'

export function initState(context: vscode.ExtensionContext): void {
  const state = new currentQuestionState(context)
  state.clear()
}
