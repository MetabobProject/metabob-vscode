import { AccountSettingTypes } from '../types'

export const defaultProvider: AccountSettingTypes = {
  initialState: {},
  suggestion: '',
  setSuggestion: () => '',
  generate: '',
  setGenerate: () => '',
  showSuggestionPaginatePanel: false,
  showGeneratePaginatePanel: false,
  discardSuggestionClicked: false,
  endorseSuggestionClicked: false,

  // tslint:disable-next-line:no-empty-function
  setDiscardSuggestionClicked: () => Boolean,

  // tslint:disable-next-line:no-empty-function
  setEndorseSuggestionClicked: () => Boolean,
  isgenerateClicked: false,
  userQuestionAboutSuggestion: '',

  // tslint:disable-next-line:no-empty-function
  setUserQuestionAboutSuggestion: () => '',
  isSuggestionClicked: false,
  setSuggestionClicked: () => Boolean,
  isGenerateWithoutQuestionLoading: false,
  setIsGenerateWithoutQuestionLoading: () => Boolean,
  userQuestionAboutRecommendation: '',
  setUserQuestionAboutRecommendation: () => '',
  isRecommendationRegenerateLoading: false,
  setIsRecommendationRegenerateLoading: () => Boolean,
  isGenerateWithQuestionLoading: false,
  setIsGenerateWithQuestionLoading: () => Boolean,
  isSuggestionRegenerateLoading: false,
  setIsSuggestionRegenerateLoading: () => Boolean,
  suggestionPaginationRegenerate: [],
  setSuggestionPaginationRegenerate: () => [],
  generatePaginationRegenerate: [],
  setGeneratePaginationRegenerate: () => []
}
