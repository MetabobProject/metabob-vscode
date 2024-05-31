import { ApiServiceBase } from '../base.service'
import FormData from 'form-data'
import { Edge, Identity, Problem, Node } from '../../types'

export interface SubmitRepresentationResponse {
  jobId: string
  status: 'complete' | 'pending' | 'running' | 'failed'
  results?: Problem[]
}

export interface SubmitCodeRepresentationPayload {
  format: 'full' | 'partial'
  identities: Identity
  nodes: Node
  edges: Edge
}

class SubmitService extends ApiServiceBase {
  /**
   * @param relativePath Relative Path of the file
   * @param fileContent Buffer Contents of the txt file
   * @param filePath Path of the file
   */
  async submitTextFile(relativePath: string, fileContent: any, _filePath: string, sessionToken: string) {
    const formData = new FormData()
    formData.append('type', 'text/plain')
    formData.append('upload', Buffer.from(fileContent, 'utf-8'), {filepath: relativePath})
    const config = this.getConfig(sessionToken, formData.getHeaders())
    const response = await this.post<SubmitRepresentationResponse>('/submit', formData, config)
    return response
  }

  /**
   * @param codeRepresentation The Code Representation of the file
   * @deprecated Not used in Vscode Extension
   */
  async submitCodeFile(codeRepresentation: SubmitCodeRepresentationPayload, sessionToken: string) {
    const config = this.getConfig(sessionToken)
    const payload = {
      body: {
        upload: codeRepresentation
      }
    }
    const response = await this.post<SubmitRepresentationResponse>('/submit', payload, config)
    return response
  }

  /**
   * Fetches the job status and results for the given job ID.
   * If no job ID is provided, returns the latest results for the session if available.
   * Returns a Promise that resolves to a JobStatus object.
   * @param jobId The Job Id of the submission
   */
  async getJobStatus(sessionToken: string, jobId?: string) {
    let jobParameters = ''
    if (jobId) {
      jobParameters = `job=${jobId}`
    }
    const endpoint = jobParameters === '' ? '/analysis' : `/analysis?${jobParameters}`
    const config = this.getConfig(sessionToken)
    const response = this.post<SubmitRepresentationResponse>(endpoint, undefined, config)
    return response
  }
}

export const submitService = new SubmitService()
