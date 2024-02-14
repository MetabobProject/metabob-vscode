import { Dispatch, SetStateAction } from 'react';

export interface AccountSettingTypes {
  initialState: any;
  suggestion: string;
  setSuggestion: Dispatch<SetStateAction<string>>;
  generate: string;
  setGenerate: Dispatch<SetStateAction<string>>;
  showSuggestionPaginatePanel: boolean;
  showGeneratePaginatePanel: boolean;
  discardSuggestionClicked: boolean;
  endorseSuggestionClicked: boolean;
  setDiscardSuggestionClicked: Dispatch<SetStateAction<boolean>>;
  setEndorseSuggestionClicked: Dispatch<SetStateAction<boolean>>;
  isgenerateClicked: boolean;
  userQuestionAboutSuggestion: string;
  setUserQuestionAboutSuggestion: Dispatch<SetStateAction<string>>;
  isSuggestionClicked: boolean;
  setSuggestionClicked: Dispatch<SetStateAction<boolean>>;
  isGenerateWithoutQuestionLoading: boolean;
  setIsGenerateWithoutQuestionLoading: Dispatch<SetStateAction<boolean>>;
  userQuestionAboutRecommendation: string;
  setUserQuestionAboutRecommendation: Dispatch<SetStateAction<string>>;
  isRecommendationRegenerateLoading: boolean;
  setIsRecommendationRegenerateLoading: Dispatch<SetStateAction<boolean>>;
  isGenerateWithQuestionLoading: boolean;
  setIsGenerateWithQuestionLoading: Dispatch<SetStateAction<boolean>>;
  isSuggestionRegenerateLoading: boolean;
  setIsSuggestionRegenerateLoading: Dispatch<SetStateAction<boolean>>;
  suggestionPaginationRegenerate: Array<any>;
  setSuggestionPaginationRegenerate: Dispatch<SetStateAction<Array<any>>>;
  generatePaginationRegenerate: Array<string>;
  setGeneratePaginationRegenerate: Dispatch<SetStateAction<Array<any>>>;
}

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

export type AnalyseMetaData = {
  id: string;
  path: string;
  startLine: number;
  endLine: number;
  category: string;
  summary: string;
  description: string;
  isDiscarded?: boolean;
};

export type AnalyzeState = {
  [filepathAndProblemId: string]: AnalyseMetaData;
};
