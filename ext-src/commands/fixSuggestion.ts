import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { Problem } from '../types'
import { currentQuestionState } from '../state/CurrentQuestion'

export type FixSuggestionCommandHandler = { path: string; id: string; vuln: Problem; jobId: string }

export function activateFixSuggestionCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.fixSuggestionCommand

  const commandHandler = async (args: FixSuggestionCommandHandler) => {
    const { path, id, vuln } = args
    const currentQuestion = new currentQuestionState(context)
    currentQuestion.set({
      path,
      id,
      vuln,
      isFix: true
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
