import * as vscode from 'vscode'
import CONSTANTS from '../constants'
import _debug from '../debug'
import { CurrentQuestion } from '../state'
import { Problem } from '../types'

export function activateDetailSuggestionCommand(context: vscode.ExtensionContext) {
  const command = CONSTANTS.showDetailSuggestionCommand

  const commandHandler = async (args: { path: string; id: string; vuln: Problem; jobId: string }) => {
    _debug.appendLine(`Detail initiated for ${args.path} with Problem ${args.id} `)
    const currentQuestionState = new CurrentQuestion(context)
    currentQuestionState.set({
      path: args.path,
      id: args.id,
      vuln: args.vuln,
      isFix: false
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
