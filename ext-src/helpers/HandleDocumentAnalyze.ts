import * as vscode from 'vscode'
import { submitService } from '../services/submit/submit.service'
import { IDocumentMetaData } from '../types'
import { Result } from 'rusty-result-ts'
import { SubmitRepresentationResponse } from '../types'
import { ApiErrorBase } from '../services/base.error'
import { AnalyzeState, IAnalyzeState } from '../store/analyze.state'
import { Util } from '../utils'
import { CONSTANTS } from '../constants'

export const verifyResponseOfSubmit = (response: Result<SubmitRepresentationResponse | null, ApiErrorBase>) => {
  if (response.isErr()) {
    return
  }

  if (response.isOk()) {
    return response.value;
  }

  return
}

export const handleDocumentAnalyze = async (
  metaDataDocument: IDocumentMetaData,
  sessionToken: string,
  analyzeState: AnalyzeState,
  jobId: string | undefined = undefined,
  suppressRateLimitErrors = false,
) => {
  const failedResponseReturn: SubmitRepresentationResponse =  {jobId: '', status: 'failed'};
  const response = jobId ? await submitService.getJobStatus(jobId) : await submitService.submitTextFile(
    metaDataDocument.relativePath,
    metaDataDocument.fileContent,
    metaDataDocument.filePath,
    sessionToken
  )

  const verifiedResponse = verifyResponseOfSubmit(response)
  if (!verifiedResponse) {
    if (!suppressRateLimitErrors) {
      vscode.window.showErrorMessage(CONSTANTS.analyzeCommandTimeoutMessage)
    }

    return failedResponseReturn
  } else if (verifiedResponse.status === 'failed') {
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage)

    return failedResponseReturn
  }

  if (verifiedResponse && (verifiedResponse.status === 'pending' || verifiedResponse?.status === 'running')) {
    return verifiedResponse; 
  } else if (verifiedResponse && verifiedResponse.status === 'complete') {
    if (verifiedResponse.results) {
      const editor = vscode.window.activeTextEditor
      const jobId = verifiedResponse.jobId

      // collect all the problems and add them to the state as separate keys
      const results: IAnalyzeState = {}

      verifiedResponse.results.forEach(problem => {
        const key = `${problem.path}@@${problem.id}`
        results[key] = {
          ...problem,
          isDiscarded: false
        }
      })

      analyzeState.set(results)

      if (editor && editor.document.fileName === metaDataDocument.filePath) {
        const decorationFromResponse = Util.transformResponseToDecorations(verifiedResponse.results, editor, jobId)
        editor.setDecorations(decorationFromResponse.decorationType, [])
        editor.setDecorations(decorationFromResponse.decorationType, decorationFromResponse.decorations)

        return verifiedResponse
      }
    }
  }

  return failedResponseReturn
}
