import * as vscode from 'vscode'
import { AnalyzeState } from '../store/analyze.state'
import { SessionState } from '../store/session.state'
import { IAnalyzeTextDocumentOnSave } from '../types'
import { Util } from '../utils'
import { handleDocumentAnalyze } from './HandleDocumentAnalyze'

export function AnalyzeDocumentOnSave(_payload: IAnalyzeTextDocumentOnSave, context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
  const sessionState = new SessionState(context).get()
  const analyzeState = new AnalyzeState(context)

  if (sessionState) {
    Util.withProgress<void>(
      handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
      'Metabob: Analyzing Document'
    )
  }
}
