import * as vscode from 'vscode'
import CONSTANTS from '../constants'
import { feedbackService, FeedbackSuggestionPayload } from '../services'
import { Session } from '../state'

export type EndorseCommandHandler = { id: string; path: string }

export function activateEndorseCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.endorseSuggestionCommand

  const commandHandler = async (args: EndorseCommandHandler) => {
    const { id: problemId } = args
    const sessionToken = new Session(context).get()?.value
    if (!sessionToken) return

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: false,
      endorsed: true
    }
    try {
      await feedbackService.endorseSuggestion(payload, sessionToken)
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
