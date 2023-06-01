import * as vscode from 'vscode'
import { Util } from '../utils'
import { SessionState } from '../store/session.state'
import { handleDocumentAnalyze } from '../helpers/HandleDocumentAnalyze'
import { AnalyzeState } from '../store/analyze.state'
import { CONSTANTS } from '../constants'
import { SubmitRepresentationResponse } from '../types'

export function activateAnalyzeCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.analyzeDocumentCommand

  const commandHandler = async () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)

      return
    }

    if (Util.isValidDocument(editor.document)) {
      const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
      const sessionState = new SessionState(context).get()
      const analyzeState = new AnalyzeState(context)
      let isInQueue = false
      let inflightJobId: string | undefined;

      _debug?.appendLine(`Metabob: Starting Analysis for ${documentMetaData.filePath}`)

      if (sessionState) {
        Util.withProgress<SubmitRepresentationResponse>(
          handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
          CONSTANTS.analyzeCommandProgressMessage
        ).then(response => {
          if (response.status === 'pending' || response.status === 'running') {
            isInQueue = true
            inflightJobId = response.jobId;
          }
        })

        if (isInQueue) {
          Util.withProgress<SubmitRepresentationResponse>(
            handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState, inflightJobId),
            CONSTANTS.analyzeCommandQueueMessage
          ).then(response => {
            if (response.status === 'failed') {
              isInQueue = false
            } else if (response.status === 'complete') {
              isInQueue = false
            } else {
              isInQueue = true
            }
          })
        }

      }
    } else {
      vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
