import * as vscode from 'vscode'
import { handleDocumentAnalyze } from '../helpers'
import { Analyze, Session } from '../state'
import debugChannel from '../debug'
import CONSTANTS from '../constants'
import Util from '../utils'
import { SubmitRepresentationResponse } from '../types'

export function activateAnalyzeCommand(context: vscode.ExtensionContext) {
  const command = CONSTANTS.analyzeDocumentCommand

  const commandHandler = async () => {
    let isInQueue = false
    let inflightJobId: string | undefined

    const analyzeState = new Analyze(context)
    const sessionState = new Session(context).get()
    if (!sessionState) return

    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)

      return
    }

    if (!Util.isValidDocument(editor.document)) {
      vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
      return
    }
    const documentMetaData = Util.extractMetaDataFromDocument(editor.document)

    debugChannel.appendLine(`Metabob: Starting Analysis for ${documentMetaData.filePath}`)

    Util.withProgress<SubmitRepresentationResponse>(
      handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
      CONSTANTS.analyzeCommandProgressMessage
    ).then(response => {
      if (response.status === 'pending' || response.status === 'running') {
        isInQueue = true
        inflightJobId = response.jobId
      }
    })

    if (isInQueue) {
      Util.withProgress<SubmitRepresentationResponse>(
        handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState, inflightJobId),
        CONSTANTS.analyzeCommandQueueMessage
      ).then(response => {
        switch (response.status) {
          case 'failed':
          case 'complete':
            isInQueue = false
            break
          case 'pending':
          case 'running':
            isInQueue = true
            break
        }
      })
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
