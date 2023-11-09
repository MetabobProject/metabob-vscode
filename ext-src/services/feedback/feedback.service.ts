import { AxiosRequestConfig } from 'axios'
import { ApiServiceBase } from '../base.service'

export interface FeedbackSuggestionPayload {
  problemId: string
  discarded: boolean
  endorsed: boolean
}

export interface FeedbackSuggestionResponse {}

export function generateFeedbackSuggestionPayload(
  data: Pick<FeedbackSuggestionPayload, 'problemId'>,
  isDiscarded: boolean,
  isEndorsed: boolean
): FeedbackSuggestionPayload {
  const { problemId } = data
  return {
    problemId,
    discarded: isDiscarded,
    endorsed: isEndorsed
  }
}

class FeedbackService extends ApiServiceBase {
  async discardSuggestion(data: FeedbackSuggestionPayload, sessionToken: string) {
    const config: AxiosRequestConfig = this.getConfig(sessionToken)
    const response = await this.post<FeedbackSuggestionResponse>('/feedback/detection', data, config)
    return response
  }

  async endorseSuggestion(data: FeedbackSuggestionPayload, sessionToken: string) {
    const config: AxiosRequestConfig = this.getConfig(sessionToken)
    const response = await this.post<FeedbackSuggestionResponse>('/feedback/detection', data, config)
    return response
  }
}

export const feedbackService = new FeedbackService()
