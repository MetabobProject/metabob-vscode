import { ApiServiceBase } from '../base.service';

export interface ExplainProblemPayload {
  problemId: string;

  /** This should describe the action that needs to be performed by the model. i.e. "Explain the effect on performance if this fix is applied" */
  prompt: string;

  /** Optional, the description stored for the problem will be used if not present.  The description will only need to be sent if it differs from the originally generated description for the problem. This will be due to either a previous call to this endpoint, or a human editing the description content. */
  description?: string;

  /**Optional, The code sent in the initial request will be used by default,  This should only be sent if code in the flagged region has been altered in some way */
  context?: string;
}

export interface SuggestRecomendationPayload {
  problemId: string;

  /** Optional, If included this will added as additional instructions for the recommendation engine. i.e. "Fix this problem using the auto_format function defined in the utils module" */
  prompt?: string;

  /** Optional, the description stored for the problem will be used if not present.
  /*  The description will only need to be sent if it differs from the originally generated description for the problem. */
  description: string;

  /**
   *   Optional, The code sent in the initial request will be used by default
   /*  This will be used as a reference for the recommendation engine but should be considered overwritten completely be the recommendation
   */
  context: string;

  /**
   * Optional, if included the recommendation returned will resume from the end of the content here.
   */
  recommendation: string;
}

export interface ExplainProblemResponse {
  description: string;
  prompt: string;
}

export interface SuggestRecomendationResponse {
  recommendation: string;
  prompt: string;
}

export class ExplainService extends ApiServiceBase {
  async explainProblem(
    data: ExplainProblemPayload,
    sessionToken: string,
    isChatConfigEnabled?: boolean,
  ) {
    const endpoint = isChatConfigEnabled === true ? '/explain?prompt_only=true' : '/explain';
    const config = this.getConfig(sessionToken);
    const response = await this.post<ExplainProblemResponse>(endpoint, data, config);
    return response;
  }

  async RecommendSuggestion(
    data: SuggestRecomendationPayload,
    sessionToken: string,
    isChatConfigEnabled?: boolean,
  ) {
    const endpoint = isChatConfigEnabled === true ? '/recommend?prompt_only=true' : '/recommend';
    const config = this.getConfig(sessionToken);
    const response = await this.post<SuggestRecomendationResponse>(endpoint, data, config);
    return response;
  }
}

export const explainService = new ExplainService();
