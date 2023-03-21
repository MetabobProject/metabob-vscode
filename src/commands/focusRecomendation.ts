import * as vscode from 'vscode'
import { Problem } from '../types'

export function activateFocusRecomendCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = 'metabob.focusRecomened'

  const commandHandler = async (args: { path: string; id: string; vuln: Problem }) => {
    _debug?.append(`Recomendations initiated for ${args.path} with Problem ${args.id} `)
  }

  vscode.commands.executeCommand('')
  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
