// ** React Imports
import { createContext, useState, ReactNode, useCallback, useEffect } from 'react'

// ** Services
import { AccountSettingTypes, MessageType } from '../types'

// ** Defaults
const defaultProvider: AccountSettingTypes = {
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

const AccountSettingContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AccountSettingProvider = ({ children }: Props): JSX.Element => {
  const [initialState, setInitialState] = useState({})
  const [showSuggestionPaginatePanel, setShowSuggestionPaginationPanel] = useState<boolean>(false)
  const [showGeneratePaginatePanel] = useState<boolean>(false)
  const [suggestion, setSuggestion] = useState('')
  const [generate, setGenerate] = useState('')
  const [discardSuggestionClicked, setDiscardSuggestionClicked] = useState(false)
  const [endorseSuggestionClicked, setEndorseSuggestionClicked] = useState(false)
  const [isgenerateClicked, setIsgenerateClicked] = useState(false)
  const [userQuestionAboutSuggestion, setUserQuestionAboutSuggestion] = useState<string>('')
  const [isSuggestionClicked, setSuggestionClicked] = useState(false)
  const [isGenerateWithoutQuestionLoading, setIsGenerateWithoutQuestionLoading] = useState<boolean>(false)
  const [userQuestionAboutRecommendation, setUserQuestionAboutRecommendation] = useState<string>('')
  const [isRecommendationRegenerateLoading, setIsRecommendationRegenerateLoading] = useState<boolean>(false)
  const [isSuggestionRegenerateLoading, setIsSuggestionRegenerateLoading] = useState<boolean>(false)
  const [isGenerateWithQuestionLoading, setIsGenerateWithQuestionLoading] = useState<boolean>(false)
  const [suggestionPaginationRegenerate, setSuggestionPaginationRegenerate] = useState<Array<any>>([])
  const [generatePaginationRegenerate, setGeneratePaginationRegenerate] = useState<Array<string>>([])

  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<MessageType>) => {
      const payload = event.data.data
      switch (event.data.type) {
        case 'initData':
          if (payload.isReset === true) {
            vscode.postMessage({
              type: 'initData:ResetRecieved',
              data: {
                input: userQuestionAboutRecommendation,
                initData: { ...payload, isReset: false }
              }
            })
            setGenerate('')
            setSuggestion('')
            setShowSuggestionPaginationPanel(false)
            setUserQuestionAboutRecommendation('')
            setUserQuestionAboutSuggestion('')
            setIsgenerateClicked(false)
          }

          if (payload.isFix === true) {
            vscode.postMessage({
              type: 'initData:FixRecieved',
              data: {
                input: userQuestionAboutRecommendation,
                initData: { ...payload, isFix: false }
              }
            })
            vscode.postMessage({
              type: 'onGenerateClicked',
              data: {
                input: userQuestionAboutRecommendation,
                initData: { ...payload }
              }
            })
            setIsGenerateWithoutQuestionLoading(true)
            setIsRecommendationRegenerateLoading(true)
            setIsGenerateWithQuestionLoading(true)
          }
          setInitialState({ ...payload })
          break

        case 'onSuggestionClicked:Response':
          const { description } = payload
          setSuggestion(description)
          if (userQuestionAboutSuggestion !== '') {
            setSuggestionPaginationRegenerate(previous => {
              return [
                ...previous,
                {
                  question: userQuestionAboutSuggestion,
                  description
                }
              ]
            })
          }
          setIsSuggestionRegenerateLoading(false)
          setShowSuggestionPaginationPanel(true)
          setSuggestionClicked(false)
          break
        case 'onSuggestionClickedGPT:Response':
          setSuggestionClicked(false)
          setIsSuggestionRegenerateLoading(false)
          setSuggestion(payload.choices[0].message.content)
          setShowSuggestionPaginationPanel(true)
          break
        case 'onGenerateClickedGPT:Response':
          setGenerate(payload.choices[0].message.content)
          break
        case 'onGenerateClicked:Response':
          const { recommendation } = payload
          const adjustedRecommendation: string = recommendation
          adjustedRecommendation.replace("'''", '')
          if (adjustedRecommendation !== '') {
            setIsGenerateWithoutQuestionLoading(false)
            setIsRecommendationRegenerateLoading(false)
            setIsGenerateWithQuestionLoading(false)
            setGenerate(recommendation)
            setGeneratePaginationRegenerate(previous => {
              return [...previous, `${recommendation}`]
            })
            setIsgenerateClicked(true)
          } else {
            setIsGenerateWithoutQuestionLoading(false)
            setIsGenerateWithQuestionLoading(false)
            setIsRecommendationRegenerateLoading(false)
          }
          break
        case 'onGenerateClicked:Error':
          setGenerate('')
          setIsGenerateWithoutQuestionLoading(false)
          setIsgenerateClicked(false)
          setIsGenerateWithQuestionLoading(false)
          setIsRecommendationRegenerateLoading(false)
          break
        case 'onSuggestionClicked:Error':
          setShowSuggestionPaginationPanel(false)
          setIsSuggestionRegenerateLoading(false)
          setSuggestionClicked(false)
          break
        case 'onDiscardSuggestionClicked:Success': {
          setDiscardSuggestionClicked(false)
          break
        }
        case 'onDiscardSuggestionClicked:Error': {
          setDiscardSuggestionClicked(false)
          break
        }
        case 'onEndorseSuggestionClicked:Success': {
          setEndorseSuggestionClicked(false)
          break
        }
        case 'onEndorseSuggestionClicked:Error': {
          setEndorseSuggestionClicked(false)
          break
        }
      }
    },
    [
      setInitialState,
      setSuggestion,
      setIsSuggestionRegenerateLoading,
      setEndorseSuggestionClicked,
      setDiscardSuggestionClicked,
      userQuestionAboutSuggestion,
      setSuggestionClicked,
      setShowSuggestionPaginationPanel,
      setGenerate,
      setIsGenerateWithoutQuestionLoading,
      setIsgenerateClicked,
      setIsGenerateWithQuestionLoading,
      setIsRecommendationRegenerateLoading,
      setGenerate
    ]
  )

  // get initial state
  useEffect(() => {
    vscode.postMessage({ type: 'getInitData' })
  }, [])

  // handle Incoming Messages
  useEffect(() => {
    window.addEventListener('message', (event: MessageEvent<MessageType>) => {
      handleMessagesFromExtension(event)
    })

    return () => {
      window.removeEventListener('message', handleMessagesFromExtension)
    }
  }, [handleMessagesFromExtension])

  const values = {
    initialState,
    suggestion,
    setSuggestion,
    generate,
    setGenerate,
    showSuggestionPaginatePanel,
    showGeneratePaginatePanel,
    discardSuggestionClicked,
    endorseSuggestionClicked,
    setDiscardSuggestionClicked,
    setEndorseSuggestionClicked,
    isgenerateClicked,
    userQuestionAboutSuggestion,
    setUserQuestionAboutSuggestion,
    isSuggestionClicked,
    setSuggestionClicked,
    isGenerateWithoutQuestionLoading,
    setIsGenerateWithoutQuestionLoading,
    userQuestionAboutRecommendation,
    setUserQuestionAboutRecommendation,
    isRecommendationRegenerateLoading,
    setIsRecommendationRegenerateLoading,
    isGenerateWithQuestionLoading,
    setIsGenerateWithQuestionLoading,
    isSuggestionRegenerateLoading,
    setIsSuggestionRegenerateLoading,
    suggestionPaginationRegenerate,
    setSuggestionPaginationRegenerate,
    generatePaginationRegenerate,
    setGeneratePaginationRegenerate
  }

  return <AccountSettingContext.Provider value={values}>{children}</AccountSettingContext.Provider>
}

export { AccountSettingContext, AccountSettingProvider }
