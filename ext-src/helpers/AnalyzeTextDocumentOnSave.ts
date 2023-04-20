import * as vscode from 'vscode'
import { AnalyzeState } from '../store/analyze.state'
import { SessionState } from '../store/session.state'
import { IAnalyzeTextDocumentOnSave } from '../types'
import { Util } from '../utils'
import { handleDocumentAnalyze } from './HandleDocumentAnalyze'
import { CONSTANTS } from '../constants'

export function AnalyzeDocumentOnSave(_payload: IAnalyzeTextDocumentOnSave, context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
  const sessionState = new SessionState(context).get()
  const analyzeState = new AnalyzeState(context)
  let isInQueue = false

  if (sessionState) {
    Util.withProgress<string>(
      handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
      CONSTANTS.analyzeCommandErrorMessage
    ).then(response => {
      if (response === 'in-queue') {
        isInQueue = true
      }
    })

    if (isInQueue) {
      Util.withProgress<string>(
        handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
        CONSTANTS.analyzeCommandQueueMessage
      ).then(response => {
        if (response === 'in-queue') {
          isInQueue = true
        } else if (response === 'success') {
          isInQueue = false
        } else {
          isInQueue = false
        }
      })
    }
  }
}
