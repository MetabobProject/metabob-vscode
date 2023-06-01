import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { GenerateDecorations } from '../helpers/GenerateDecorations'
import { feedbackService } from '../services/feedback/feedback.service'
import { AnalyzeState, IAnalyzeState } from '../store/analyze.state'
import { SessionState } from '../store/session.state'
import { Util } from '../utils'
import { currentQuestionState } from '../store/currentQuestion.state'
import { RecommendationWebView } from '../providers/recommendation.provider'
import { Problem } from '../types'

export function activateDiscardCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.discardSuggestionCommand

  const commandHandler = async (args: { id: string; path: string }) => {
    const session = new SessionState(context).get()?.value
    const state = new currentQuestionState(context)
    const webview = context.globalState.get<RecommendationWebView>(CONSTANTS.webview)

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
        const problems = (analyzeState.get()?.value ?? {}) as IAnalyzeState
        const key = `${args.path}@@${args.id}`

        if (Util.isValidDocument(editor.document)) {
          problems[key] = {
            ...problems[key],
            isDiscarded: true
          }
  
          analyzeState.set(problems)

          // Map all non discarded problems to the results array
          const results = Object.keys(analyzeState.get()?.value ?? {})
            .filter(key => !analyzeState.get()?.value[key].isDiscarded)
            .map(key => analyzeState.get()?.value[key] ?? {} as Problem)
          

          const editor = vscode.window.activeTextEditor
          if (editor) {
            const decorations = GenerateDecorations(results, editor)
            editor.setDecorations(decorations.decorationType, [])
            editor.setDecorations(decorations.decorationType, decorations.decorations)
          }
          state.clear()
          webview?.postInitData(state.get()?.value)
        } else {
          _debug?.appendLine(CONSTANTS.editorSelectedIsInvalid)
        }
      })
      .catch(err => {
        _debug?.appendLine(err.message)
      })
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
