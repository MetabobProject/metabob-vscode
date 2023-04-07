import { ApiServiceBase } from '../base.service'

export interface IExplainProblemPayload {
  problemId: string

  /** This should describe the action that needs to be performed by the model. i.e. "Explain the effect on performance if this fix is applied" */
  prompt: string

  /** Optional, the description stored for the problem will be used if not present.  The description will only need to be sent if it differs from the originally generated description for the problem. This will be due to either a previous call to this endpoint, or a human editing the description content. */
  description?: string

  /**Optional, The code sent in the initial request will be used by default,  This should only be sent if code in the flagged region has been altered in some way */
  context?: string
}

export interface IRecomendSuggestionPayload {
  problemId: string

  /** Optional, If included this will added as additional instructions for the recommendation engine. i.e. "Fix this problem using the auto_format function defined in the utils module" */
  prompt?: string

  /** Optional, the description stored for the problem will be used if not present.
  /*  The description will only need to be sent if it differs from the originally generated description for the problem. */
  description: string

  /**
   *   Optional, The code sent in the initial request will be used by default
   /*  This will be used as a reference for the recommendation engine but should be considered overwritten completely be the recommendation
   */
  context: string

  /**
   * Optional, if included the recommendation returned will resume from the end of the content here.
   */
  recommendation: string
}

interface IExplainProblemResponse {
  description: string
}

interface ISuggestRecomendationResponse {
  recommendation: string
}

export class ExplainService extends ApiServiceBase {
  async explainProblem(payload: IExplainProblemPayload, sessionToken: string, isChatConfigEnabled?: boolean) {
    const endpoint = isChatConfigEnabled ? '/explain?prompt_only=true' : '/explain'
    const response = await this.post<IExplainProblemResponse>(
      endpoint,
      {
        problemId: payload.problemId,
        prompt: payload.prompt
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`
        }
      }
    )

    return response
  }

  async recomendSuggestion(payload: IRecomendSuggestionPayload, sessionToken: string, isChatConfigEnabled?: boolean) {
    const endpoint = isChatConfigEnabled ? '/recommend?prompt_only=true' : '/recommend'
    const response = await this.post<ISuggestRecomendationResponse>(
      endpoint,
      {
        ...payload
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`
        }
      }
    )

    return response
  }
}

export const explainService = new ExplainService()
