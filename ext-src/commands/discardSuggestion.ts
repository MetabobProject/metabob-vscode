import * as vscode from 'vscode'
import { CurrentQuestion, Analyze, Session } from '../state'
import { GenerateDecorations } from '../helpers/GenerateDecorations'
import { FeedbackSuggestionPayload, feedbackService } from '../services'
import { RecommendationWebView } from '../providers/recommendation.provider'
import CONSTANTS from '../constants'
import Utils from '../utils'
import _debug from '../debug'
import { Problem } from '../types'

export type DiscardCommandHandler = { id: string; path: string }

export function activateDiscardCommand(context: vscode.ExtensionContext) {
  const command = CONSTANTS.discardSuggestionCommand

  const commandHandler = async (args: DiscardCommandHandler) => {
    const { id: problemId, path } = args
    const key = `${path}@@${problemId}`

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)
      return
    }

    if (!Utils.isValidDocument(editor.document)) {
      _debug?.appendLine(CONSTANTS.editorSelectedIsInvalid)
      return
    }

    const session = new Session(context).get()?.value
    if (!session) return

    const analyzeState = new Analyze(context)
    const currentQuestion = new CurrentQuestion(context)

    const problems = analyzeState.get()?.value
    if (!problems) return

    const webview = context.globalState.get<RecommendationWebView>(CONSTANTS.webview)
    if (!webview || !webview.postInitData) return

    const payload: FeedbackSuggestionPayload = {
      problemId,
      discarded: true,
      endorsed: false
    }

    try {
      await feedbackService.discardSuggestion(payload, session)
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
