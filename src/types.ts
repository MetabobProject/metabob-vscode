import { Dispatch, SetStateAction } from 'react'

export interface AccountSettingTypes {
  initialState: any
  suggestion: string
  generate: string
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
  userQuestionAboutRecomendation: string
  setUserQuestionAboutRecomendation: Dispatch<SetStateAction<string>>
  isRecomendationRegenerateLoading: boolean
  setIsRecomendationRegenerateLoading: Dispatch<SetStateAction<boolean>>
  isGenerateWithQuestionLoading: boolean
  setIsGenerateWithQuestionLoading: Dispatch<SetStateAction<boolean>>
}

export interface MessageType {
  type: string
  data: any
}
