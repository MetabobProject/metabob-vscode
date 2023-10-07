import * as vscode from 'vscode'
import { SubmitRepresentationResponse } from '../services'
import { handleDocumentAnalyze } from '../helpers'
import { Analyze, Session } from '../state'
import debugChannel from '../debug'
import CONSTANTS from '../constants'
import Util from '../utils'

export function activateAnalyzeCommand(context: vscode.ExtensionContext) {
  const command = CONSTANTS.analyzeDocumentCommand

  const commandHandler = async () => {
    let isInQueue = false
    let inflightJobId: string | undefined

    const analyzeState = new Analyze(context)
    const sessionToken = new Session(context).get()?.value
    if (!sessionToken) {
      throw new Error('activateAnalyzeCommand: Session Token is undefined')
    }

    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)
      throw new Error('activateAnalyzeCommand: Editor is undefined')
    }

    if (!Util.isValidDocument(editor.document)) {
      vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
      throw new Error('activateAnalyzeCommand: Selected Document is not valid')
    }
    const documentMetaData = Util.extractMetaDataFromDocument(editor.document)

    debugChannel.appendLine(`Metabob: Starting Analysis for ${documentMetaData.filePath}`)

    Util.withProgress<SubmitRepresentationResponse>(
      handleDocumentAnalyze(documentMetaData, sessionToken, analyzeState),
      CONSTANTS.analyzeCommandProgressMessage
    ).then(response => {
      if (response.status === 'pending' || response.status === 'running') {
        isInQueue = true
        inflightJobId = response.jobId
      }
    })

    if (!isInQueue) {
      return
    }

    Util.withProgress<SubmitRepresentationResponse>(
      handleDocumentAnalyze(documentMetaData, sessionToken, analyzeState, inflightJobId),
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

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
