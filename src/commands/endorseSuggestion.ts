import * as vscode from 'vscode'
import { feedbackService } from '../services/feedback/feedback.service'
import { SessionState } from '../store/session.state'

export function activateEndorseCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = 'metabob.endorseSuggestion'

  const commandHandler = async (args: { id: string }) => {
    const session = new SessionState(context).get()?.value
    if (session) {
      feedbackService
        .endorseSuggestion({
          problemId: args.id,
          sessionToken: session
        })
        .then(() => {
          vscode.window.showInformationMessage('Metabob: Thank you for Endorsing The Problem.')
        })
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
