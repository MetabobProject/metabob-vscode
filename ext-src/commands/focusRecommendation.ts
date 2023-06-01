import * as vscode from 'vscode'
import { currentQuestionState } from '../store/currentQuestion.state'
import { Problem } from '../types'
import { CONSTANTS } from '../constants'
import { RecommendationWebView } from '../providers/recommendation.provider'

export function activateFocusRecommendCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel): void {
  const command = 'metabob.focusRecommend'

  const commandHandler = async (args: { path: string; id: string; vuln: Problem; jobId: string }) => {
    _debug?.appendLine(`Current Detection Set for ${args.path} with Problem ${args.id} `)
    const state = new currentQuestionState(context)
    const webview = context.globalState.get<RecommendationWebView>(CONSTANTS.webview)
    state.set({
      path: args.path,
      id: args.id,
      vuln: args.vuln,
      isFix: false,
      isReset: true
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')
    webview?.postInitData(state.get()?.value)
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
