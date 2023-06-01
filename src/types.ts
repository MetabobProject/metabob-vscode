import { Dispatch, SetStateAction } from 'react'

export interface AccountSettingTypes {
  initialState: any
  suggestion: string
  setSuggestion: Dispatch<SetStateAction<string>>
  generate: string
  setGenerate: Dispatch<SetStateAction<string>>
  showSuggestionPaginatePanel: boolean
  showGeneratePaginatePanel: boolean
  discardSuggestionClicked: boolean
  endorseSuggestionClicked: boolean
  setDiscardSuggestionClicked: Dispatch<SetStateAction<boolean>>
  setEndorseSuggestionClicked: Dispatch<SetStateAction<boolean>>
  isgenerateClicked: boolean
  userQuestionAboutSuggestion: string
  setUserQuestionAboutSuggestion: Dispatch<SetStateAction<string>>
  isSuggestionClicked: boolean
  setSuggestionClicked: Dispatch<SetStateAction<boolean>>
  isGenerateWithoutQuestionLoading: boolean
  setIsGenerateWithoutQuestionLoading: Dispatch<SetStateAction<boolean>>
  userQuestionAboutRecommendation: string
  setUserQuestionAboutRecommendation: Dispatch<SetStateAction<string>>
  isRecommendationRegenerateLoading: boolean
  setIsRecommendationRegenerateLoading: Dispatch<SetStateAction<boolean>>
  isGenerateWithQuestionLoading: boolean
  setIsGenerateWithQuestionLoading: Dispatch<SetStateAction<boolean>>
  isSuggestionRegenerateLoading: boolean
  setIsSuggestionRegenerateLoading: Dispatch<SetStateAction<boolean>>
  suggestionPaginationRegenerate: Array<any>
  setSuggestionPaginationRegenerate: Dispatch<SetStateAction<Array<any>>>
  generatePaginationRegenerate: Array<string>
  setGeneratePaginationRegenerate: Dispatch<SetStateAction<Array<any>>>
}

export interface MessageType {
  type: string
  data: any
}
