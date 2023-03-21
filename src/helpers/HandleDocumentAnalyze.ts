import * as vscode from 'vscode'
import { submitService } from '../services/submit/submit.service'
import { IDocumentMetaData } from '../types'
import { transformResponseToDecorations } from './TransformResponseToDecorations'
import { Result } from 'rusty-result-ts'
import { SubmitRepresentationResponse } from '../types'
import { ApiErrorBase } from '../services/base.error'
import { queue } from '../helpers/Queue'
import { AnalyzeState } from '../store/analyze.state'

export const verifyResponseOfSubmit = (response: Result<SubmitRepresentationResponse | null, ApiErrorBase>) => {
  if (response.isErr()) {
    return
  }

  if (response.isOk()) {
    if (response.value?.status === 'complete') {
      return response.value
    } else if (response.value?.status === 'pending' || response.value?.status === 'running') {
      queue?.enqueue(response.value)
    }
  }

  return
}

export const handleDocumentAnalyze = async (
  metaDataDocument: IDocumentMetaData,
  sessionToken: string,
  analyzeState: AnalyzeState
) => {
  const response = await submitService.submitTextFile(
    metaDataDocument.relativePath,
    metaDataDocument.fileContent,
    metaDataDocument.filePath,
    sessionToken
  )

  const verifiedResponse = verifyResponseOfSubmit(response)
  if (!verifiedResponse) {
    vscode.window.showErrorMessage('Metabob: Error Analyzing the Document')

    return
  }

  if (verifiedResponse.results) {
    const editor = vscode.window.activeTextEditor
    verifiedResponse.results.forEach(problem => {
      analyzeState.set({
        [`${problem.path}@@${problem.id}`]: {
          ...problem,
          isDiscarded: false
        }
      })
    })

    if (editor && editor.document.fileName === metaDataDocument.filePath) {
      const decorationFromResponse = transformResponseToDecorations(verifiedResponse.results, editor)

      editor.setDecorations(decorationFromResponse.decorationType, [])
      editor.setDecorations(decorationFromResponse.decorationType, decorationFromResponse.decorations)
    }
  }

  return
}
