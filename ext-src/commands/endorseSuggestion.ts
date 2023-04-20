import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { feedbackService } from '../services/feedback/feedback.service'
import { SessionState } from '../store/session.state'

export function activateEndorseCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.endorseSuggestionCommand

  const commandHandler = async (args: { id: string }) => {
    const session = new SessionState(context).get()?.value
    if (session) {
      feedbackService
        .endorseSuggestion({
          problemId: args.id,
          sessionToken: session
        })
        .then(() => {
          _debug?.appendLine(`Metabob: Endorsed Problem With ${args.id}`)
          vscode.window.showInformationMessage(CONSTANTS.endorseCommandSuccessMessage)
        })
        .catch(() => {
          _debug?.appendLine(`Metabob: Error Endorsing Problem With ${args.id}`)
          vscode.window.showErrorMessage(CONSTANTS.endorseCommandErrorMessage)
        })
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
