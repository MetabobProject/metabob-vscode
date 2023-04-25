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
}

export interface MessageType {
  type: string
  data: any
}
