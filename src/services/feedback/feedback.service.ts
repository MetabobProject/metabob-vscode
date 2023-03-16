import { CreateSessionRequest, CreateSessionResponse, getUserSessionResponse } from '../../types';
import { ApiServiceBase } from '../base.service';

export interface IFeedbackSuggestion {
  problemId: string;
  sessionToken: string;
}

class FeedbackService extends ApiServiceBase {
  async discardSuggestion(payload: IFeedbackSuggestion) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${payload.sessionToken}`,
    };

    const response = await this.post<CreateSessionResponse>(
      '/feedback/detection',
      {
        problemId: payload.problemId,
        discarded: true,
        endorsed: false,
      },
      headers
    );
    return response;
  }

  async endorseSuggestion(payload: IFeedbackSuggestion) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${payload.sessionToken}`,
    };

    const response = await this.post<CreateSessionResponse>(
      '/feedback/detection',
      {
        problemId: payload.problemId,
        discarded: false,
        endorsed: true,
      },
      headers
    );
    return response;
  }
}

export const feedbackService = new FeedbackService();
