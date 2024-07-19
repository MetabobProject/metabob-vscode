export interface MessageType {
  type: EventDataType;
  data: any;
}

export enum EventDataType {
  INIT_DATA = 'initData',
  GET_INIT_DATA = 'getInitData',
  SUGGESTION_CLICKED_RESPONSE = 'onSuggestionClicked:Response',
  SUGGESTION_CLICKED_GPT_RESPONSE = 'onSuggestionClickedGPT:Response',
  SUGGESTION_CLICKED_ERROR = 'onSuggestionClicked:Error',
  GENERATE_CLICKED_RESPONSE = 'onGenerateClicked:Response',
  GENERATE_CLICKED_GPT_RESPONSE = 'onGenerateClickedGPT:Response',
  GENERATE_CLICKED_ERROR = 'onGenerateClicked:Error',
  DISCARD_SUGGESTION_SUCCESS = 'onDiscardSuggestionClicked:Success',
  DISCARD_SUGGESTION_ERROR = 'onDiscardSuggestionClicked:Error',
  ENDORSE_SUGGESTION_SUCCESS = 'onEndorseSuggestionClicked:Success',
  ENDORSE_SUGGESTION_ERROR = 'onEndorseSuggestionClicked:Error',
  ANALYSIS_ERROR = 'Analysis_Error',
  ANALYSIS_COMPLETED = 'Analysis_Completed',
  ANALYSIS_CALLED_ON_SAVE = 'Analysis_Called_On_Save',
  NO_EDITOR_DETECTED = 'No_Editor_Detected',
  FIX_SUGGESTION = 'FIX_SUGGESTION',
  CURRENT_FILE = 'CURRENT_FILE',
  CURRENT_PROJECT = 'CURRENT_PROJECT',
  INIT_DATA_UPON_NEW_FILE_OPEN = 'INIT_DATA_UPON_NEW_FILE_OPEN',
  ANALYSIS_COMPLETED_EMPTY_PROBLEMS = 'Analysis_Completed_Empty_Problems',
  VISIBILITY_LOST = 'VISIBILITY_LOST',
}

export enum ApplicationWebviewState {
  ANALYZE_MODE,
  SUGGESTION_MODE,
}

export interface Problem {
  id: string;
  path: string;
  startLine: number;
  endLine: number;
  category: string;
  summary: string;
  description: string;
}

export interface FixSuggestionsPayload {
  path: string;
  id: string;
  vuln: Problem;
  isFix: boolean;
  isReset: boolean;
}

export interface RecommendationPayload {
  recommendation: string;
}

export type AnalysisData = {
  isValid: boolean;
  problems: ProblemData[];
};

export type ProblemData = Problem & {
  discarded: boolean;
  endorsed: boolean;
  severity: string;
  isViewed?: boolean;
};

export type AnalyzeState = {
  [filepath: string]: AnalysisData[];
};
