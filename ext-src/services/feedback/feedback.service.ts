import { CreateSessionResponse } from '../../types'
import { ApiServiceBase } from '../base.service'

export interface IFeedbackSuggestion {
  problemId: string
  sessionToken: string
}

class FeedbackService extends ApiServiceBase {
  async discardSuggestion(payload: IFeedbackSuggestion) {

    const response = await this.post<CreateSessionResponse>(
      '/feedback/detection',
      {
        problemId: payload.problemId,
        discarded: true,
        endorsed: false
      },
      {
        headers: {
          "Authorization": `Bearer ${payload.sessionToken}`,
          "Content-Type": "application/json"
        }
      }
    )

    return response
  }

  async endorseSuggestion(payload: IFeedbackSuggestion) {

    const response = await this.post<CreateSessionResponse>(
      '/feedback/detection',
      {
        problemId: payload.problemId,
        discarded: false,
        endorsed: true
      },
      {
        headers: {
          "Authorization": `Bearer ${payload.sessionToken}`,
          "Content-Type": "application/json"
        }
      }
    )

    return response
  }
}

export const feedbackService = new FeedbackService()
