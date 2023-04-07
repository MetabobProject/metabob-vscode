import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { Problem } from '../types'
import { currentQuestionState } from '../store/currentQuestion.state'

export function activateFixSuggestionCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.fixSuggestionCommand

  const commandHandler = async (args: { path: string; id: string; vuln: Problem; jobId: string }) => {
    const state = new currentQuestionState(context)
    state.set({
      path: args.path,
      id: args.id,
      vuln: args.vuln,
      isFix: true
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
