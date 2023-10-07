import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { Problem } from '../types'
import { currentQuestionState } from '../state/CurrentQuestion'

export function activateDetailSuggestionCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.showDetailSuggestionCommand

  const commandHandler = async (args: { path: string; id: string; vuln: Problem; jobId: string }) => {
    _debug?.append(`Detail initiated for ${args.path} with Problem ${args.id} `)
    const state = new currentQuestionState(context)
    state.set({
      path: args.path,
      id: args.id,
      vuln: args.vuln,
      isFix: false
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
