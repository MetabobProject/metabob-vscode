import * as vscode from 'vscode'
import { Util } from '../utils'
import { SessionState } from '../store/session.state'
import { handleDocumentAnalyze } from '../helpers/HandleDocumentAnalyze'
import { AnalyzeState } from '../store/analyze.state'
import { CONSTANTS } from '../constants'
import { Problem } from '../types'
import { currentQuestionState } from '../store/currentQuestion.state'

export function activateFixSuggestionCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.fixSuggestionCommand

  const commandHandler = async (args: { path: string; id: string; vuln: Problem; jobId: string }) => {
    const state = new currentQuestionState(context)
    state.set({
      path: args.path,
      id: args.id,
      vuln: args.vuln
    })
    vscode.commands.executeCommand('recommendation-panel-webview.focus')

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)

      return
    }

    if (Util.isValidDocument(editor.document)) {
      const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
      const sessionState = new SessionState(context).get()
      const analyzeState = new AnalyzeState(context)

      if (sessionState) {
        Util.withProgress<void>(
          handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
          CONSTANTS.analyzeCommandProgressMessage
        )
        _debug?.appendLine(`Metabob: Analyzed file ${documentMetaData.filePath}`)
      }
    } else {
      vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
