import * as vscode from 'vscode'
import { Util } from '../utils'
import { SessionState } from '../store/session.state'
import { handleDocumentAnalyze } from '../helpers/HandleDocumentAnalyze'
import { AnalyzeState } from '../store/analyze.state'

export function activateAnalyzeCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = 'metabob.analyzeDocument'

  const commandHandler = async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('Editor is not Selected')

      return
    }

    if (Util.isValidDocument(editor.document)) {
      const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
      const sessionState = new SessionState(context).get()
      const analyzeState = new AnalyzeState(context)

      if (sessionState) {
        Util.withProgress<void>(
          handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
          'Metabob: Analyzing Document'
        )
        _debug?.appendLine(`Metabob: Analyzed file ${documentMetaData.filePath}`)
      }
    } else {
      vscode.window.showErrorMessage('Metabob: Selected Document Is Invalid')
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
