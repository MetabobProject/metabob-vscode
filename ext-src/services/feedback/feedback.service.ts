import { AxiosRequestConfig } from 'axios'
import { ApiServiceBase } from '../base.service'
import { CreateSessionResponse } from '../../types'

export interface FeedbackSuggestion {
  problemId: string
  sessionToken: string
}

class FeedbackService extends ApiServiceBase {
  generatePayload(data: FeedbackSuggestion, isDiscarded: boolean, isEndorsed: boolean) {
    const { problemId } = data
    const payload = {
      problemId,
      discarded: isDiscarded,
      endorsed: isEndorsed
    }
    return payload
  }

  async discardSuggestion(data: FeedbackSuggestion) {
    const { sessionToken } = data
    const config: AxiosRequestConfig = this.getConfig(sessionToken)
    const payload = this.generatePayload(data, true, false)
    const response = await this.post<CreateSessionResponse>('/feedback/detection', payload, config)
    return response
  }

  async endorseSuggestion(data: FeedbackSuggestion) {
    const { sessionToken } = data
    const config: AxiosRequestConfig = this.getConfig(sessionToken)
    const payload = this.generatePayload(data, false, true)
    const response = await this.post<CreateSessionResponse>('/feedback/detection', payload, config)
    return response
  }
}

export const feedbackService = new FeedbackService()
