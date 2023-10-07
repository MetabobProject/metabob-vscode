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

export type DiscardCommandHandler = { id: string; path: string }

export function activateDiscardCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.discardSuggestionCommand

  const commandHandler = async (args: DiscardCommandHandler) => {
    const { id, path } = args
    const key = `${path}@@${id}`

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)
      return
    }

    if (!Util.isValidDocument(editor.document)) {
      _debug?.appendLine(CONSTANTS.editorSelectedIsInvalid)
      return
    }

    const session = new SessionState(context).get()?.value
    if (!session) return

    const analyzeState = new AnalyzeState(context)
    const currentQuestion = new currentQuestionState(context)

    const problems = analyzeState.get()?.value as IAnalyzeState | undefined
    if (!problems) return

    const webview = context.globalState.get<RecommendationWebView>(CONSTANTS.webview)
    if (!webview || !webview.postInitData) return

    try {
      await feedbackService.discardSuggestion({
        problemId: args.id,
        sessionToken: session
      })
    } catch (err: any) {
      _debug?.appendLine(err.message)
    }

    problems[key] = {
      ...problems[key],
      isDiscarded: true
    }

    try {
      await analyzeState.set(problems)
    } catch (error) {
      _debug?.appendLine(error)
      return
    }

    // Map all non discarded problems to the results array
    const results = Object.keys(analyzeState.get()?.value ?? {})
      .filter(key => !analyzeState.get()?.value[key].isDiscarded)
      .map(key => analyzeState.get()?.value[key] ?? ({} as Problem))

    const decorations = GenerateDecorations(results, editor)
    editor.setDecorations(decorations.decorationType, [])
    editor.setDecorations(decorations.decorationType, decorations.decorations)
    currentQuestion.clear()
    const currentQuestionMarshalled = currentQuestion.get()?.value
    if (!currentQuestionMarshalled) return

    webview.postInitData(currentQuestionMarshalled)
    return
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
