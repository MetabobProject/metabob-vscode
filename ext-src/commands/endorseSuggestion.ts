import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { feedbackService } from '../services/feedback/feedback.service'
import { SessionState } from '../state/Session'

export type EndorseCommandHandler = { id: string }

export function activateEndorseCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.endorseSuggestionCommand

  const commandHandler = async (args: EndorseCommandHandler) => {
    const { id: problemId } = args
    const sessionToken = new SessionState(context).get()?.value
    if (!sessionToken) return

    try {
      await feedbackService.endorseSuggestion({
        problemId,
        sessionToken
      })
    } catch {
      _debug?.appendLine(`Metabob: Error Endorsing Problem With ${args.id}`)
      vscode.window.showErrorMessage(CONSTANTS.endorseCommandErrorMessage)
      return
    }
    _debug?.appendLine(`Metabob: Endorsed Problem With ${args.id}`)
    vscode.window.showInformationMessage(CONSTANTS.endorseCommandSuccessMessage)
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
