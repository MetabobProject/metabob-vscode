import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { GenerateDecorations } from '../helpers/GenerateDecorations'
import { feedbackService } from '../services/feedback/feedback.service'
import { AnalyzeState, IAnalyzeState } from '../store/analyze.state'
import { SessionState } from '../store/session.state'
import { Util } from '../utils'

export function activateDiscardCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.discardSuggestionCommand

  const commandHandler = async (args: { id: string; path: string }) => {
    const session = new SessionState(context).get()?.value
    if (!session) return

    feedbackService
      .discardSuggestion({
        problemId: args.id,
        sessionToken: session
      })
      .then(() => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)

          return
        }

        const analyzeState = new AnalyzeState(context)
        const key = `${args.path}@@${args.id}`

        if (Util.isValidDocument(editor.document)) {
          analyzeState.update((value: IAnalyzeState) => {
            value[key] = {
              ...value[key],
              isDiscarded: true
            }
            const valueKeys = Object.keys(value)
            const results = []

            for (const k in valueKeys) {
              const p = value[valueKeys[k]]
              if (valueKeys[k] === key) {
                continue
              } else {
                results.push(p)
              }
            }
            const editor = vscode.window.activeTextEditor
            if (editor) {
              const decorations = GenerateDecorations(results, editor)
              editor.setDecorations(decorations.decorationType, [])
              editor.setDecorations(decorations.decorationType, decorations.decorations)
            }

            return value
          })
        } else {
          _debug?.append(CONSTANTS.editorSelectedIsInvalid)
          vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
        }
      })
      .catch(() => {
        vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
      })
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
