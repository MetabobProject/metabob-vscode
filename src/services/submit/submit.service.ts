import { ApiServiceBase } from '../base.service';
import FormData from 'form-data';
import * as path from 'path';
import { SubmitRepresentationResponse, SubmitCodeRepresentationPayload } from '../../types';

class SubmitService extends ApiServiceBase {
  /**
   * @param relativePath Relative Path of the file
   * @param fileContent Buffer Contents of the txt file
   * @param filePath Path of the file
   */
  async submitTextFile(
    relativePath: string,
    fileContent: any,
    filePath: string,
    sessionToken: string
  ) {
    const formData = new FormData();
    formData.append(relativePath, fileContent, { filename: path.basename(filePath) });

    const response = await this.post<SubmitRepresentationResponse>('/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    return response;
  }

  /**
   * @param codeRepresentation The Code Representation of the file
   */
  async submitCodeFile(codeRepresentation: SubmitCodeRepresentationPayload, sessionToken: string) {
    const response = await this.post<SubmitRepresentationResponse>('/submit', codeRepresentation, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    return response;
  }

  /**
   * Fetches the job status and results for the given job ID.
   * If no job ID is provided, returns the latest results for the session if available.
   * Returns a Promise that resolves to a JobStatus object.
   * @param jobId The Job Id of the submission
   */
  async getJobStatus(jobId?: string) {
    const url = `/analysis${jobId ? `?job=${jobId}` : ''}`;
    const response = this.post<SubmitRepresentationResponse>(url);
    return response;
  }
}

export const submitService = new SubmitService();
