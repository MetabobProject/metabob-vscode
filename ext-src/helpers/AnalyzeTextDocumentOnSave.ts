import * as vscode from 'vscode'
import { AnalyzeState } from '../state/Analyze'
import { SessionState } from '../state/Session'
import { IAnalyzeTextDocumentOnSave, SubmitRepresentationResponse } from '../types'
import { Util } from '../utils'
import { handleDocumentAnalyze } from './HandleDocumentAnalyze'
import { CONSTANTS } from '../constants'

export async function AnalyzeDocumentOnSave(_payload: IAnalyzeTextDocumentOnSave, context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
  const sessionState = new SessionState(context).get()
  const analyzeState = new AnalyzeState(context)
  let isInQueue = false

  if (sessionState) {
    const jobId = await Util.withProgress<SubmitRepresentationResponse>(
      handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState, undefined, true),
      CONSTANTS.analyzeCommandProgressMessage
    ).then(response => {
      if (response.status === 'pending' || response.status === 'running') {
        isInQueue = true

        return response.jobId
      }

      return
    })

    if (isInQueue) {
      Util.withProgress<SubmitRepresentationResponse>(
        handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState, jobId, true),
        CONSTANTS.analyzeCommandQueueMessage
      ).then(response => {
        if (response.status === 'complete' || response.status === 'failed') {
          isInQueue = false
        } else {
          isInQueue = true
        }
      })
    }
  }
}
