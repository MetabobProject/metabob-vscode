import * as vscode from 'vscode'
import CONSTANTS from '../constants'
import { Problem } from '../types'
import { CurrentQuestion } from '../state'
import _debug from '../debug'

export type FixSuggestionCommandHandler = { path: string; id: string; vuln: Problem; jobId?: string }

export function activateFixSuggestionCommand(context: vscode.ExtensionContext) {
  const command = CONSTANTS.fixSuggestionCommand

  const commandHandler = async (args: FixSuggestionCommandHandler) => {
    const { path, id, vuln } = args
    const currentQuestionState = new CurrentQuestion(context)
    currentQuestionState.set({
      path,
      id,
      vuln,
      isFix: true
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
