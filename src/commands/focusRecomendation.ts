import * as vscode from 'vscode'
import { currentQuestionState } from '../store/currentQuestion.state'
import { Problem } from '../types'

export function activateFocusRecomendCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = 'metabob.focusRecomened'

  const commandHandler = async (args: { path: string; id: string; vuln: Problem; jobId: string }) => {
    _debug?.append(`Recomendations initiated for ${args.path} with Problem ${args.id} `)
    const state = new currentQuestionState(context)
    state.set({
      path: args.path,
      id: args.id,
      vuln: args.vuln
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
