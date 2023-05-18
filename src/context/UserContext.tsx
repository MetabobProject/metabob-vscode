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
  userQuestionAboutRecomendation: '',
  setUserQuestionAboutRecomendation: () => '',
  isRecomendationRegenerateLoading: false,
  setIsRecomendationRegenerateLoading: () => Boolean,
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

const AccountSettingProvider = ({ children }: Props) => {
  const [initialState, setInitialState] = useState<any>({})
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
  const [userQuestionAboutRecomendation, setUserQuestionAboutRecomendation] = useState<string>('')
  const [isRecomendationRegenerateLoading, setIsRecomendationRegenerateLoading] = useState<boolean>(false)
  const [isSuggestionRegenerateLoading, setIsSuggestionRegenerateLoading] = useState<boolean>(false)
  const [isGenerateWithQuestionLoading, setIsGenerateWithQuestionLoading] = useState<boolean>(false)
  const [suggestionPaginationRegenerate, setSuggestionPaginationRegenerate] = useState<Array<any>>([])
  const [generatePaginationRegenerate, setGeneratePaginationRegenerate] = useState<Array<string>>([])

  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<MessageType>) => {
      const payload = event.data.data
      switch (event.data.type) {
        case 'getProblemPersist:Recieved': {
          if (payload.id === initialState.id) {
            if (payload.suggestion !== undefined) {
              setSuggestion(payload.suggestion)
            }
            if (payload.generate !== undefined) {
              setGenerate(payload.generate)
            }
            if (payload.question !== undefined) {
              setUserQuestionAboutSuggestion(payload.question)
            }
            if (
              payload.generatePaginationRegenerate !== undefined &&
              payload.generatePaginationRegenerate?.length > 0
            ) {
              setGeneratePaginationRegenerate(payload.generatePaginationRegenerate)
            }
            if (
              payload.suggestionPaginationRegenerate !== undefined &&
              payload.suggestionPaginationRegenerate?.length > 0
            ) {
              setSuggestionPaginationRegenerate(payload.suggestionPaginationRegenerate)
            }
          }
          break
        }
        case 'initData':
          if (payload.isReset === true) {
            vscode.postMessage({
              type: 'initData:ResetRecieved',
              data: {
                input: userQuestionAboutRecomendation,
                initData: { ...payload, isReset: false }
              }
            })
            setGenerate('')
            setSuggestion('')
            setShowSuggestionPaginationPanel(false)
            setUserQuestionAboutRecomendation('')
            setUserQuestionAboutSuggestion('')
            setIsgenerateClicked(false)
          }

          if (payload.isFix === true) {
            vscode.postMessage({
              type: 'initData:FixRecieved',
              data: {
                input: userQuestionAboutRecomendation,
                initData: { ...payload, isFix: false }
              }
            })
            vscode.postMessage({
              type: 'onGenerateClicked',
              data: {
                input: userQuestionAboutRecomendation,
                initData: { ...payload }
              }
            })
            setIsGenerateWithoutQuestionLoading(true)
            setIsRecomendationRegenerateLoading(true)
            setIsGenerateWithQuestionLoading(true)
          }
          vscode.postMessage({
            type: 'onProblemPersist:Sent',
            data: {
              input: {
                [initialState.id]: {
                  id: initialState.id,
                  path: initialState.path,
                  suggestion,
                  recomendation: generate,
                  question: userQuestionAboutSuggestion,
                  suggestionPaginationRegenerate,
                  generatePaginationRegenerate
                }
              }
            }
          })
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
          const adjustedRecomendation: string = recommendation
          adjustedRecomendation.replace("'''", '')
          if (adjustedRecomendation !== '') {
            setIsGenerateWithoutQuestionLoading(false)
            setIsRecomendationRegenerateLoading(false)
            setIsGenerateWithQuestionLoading(false)
            setGenerate(recommendation)
            setGeneratePaginationRegenerate(previous => {
              return [...previous, `${recommendation}`]
            })
            setIsgenerateClicked(true)
          } else {
            setIsGenerateWithoutQuestionLoading(false)
            setIsGenerateWithQuestionLoading(false)
            setIsRecomendationRegenerateLoading(false)
          }
          break
        case 'onGenerateClicked:Error':
          setGenerate('')
          setIsGenerateWithoutQuestionLoading(false)
          setIsgenerateClicked(false)
          setIsGenerateWithQuestionLoading(false)
          setIsRecomendationRegenerateLoading(false)
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
      suggestion,
      setIsSuggestionRegenerateLoading,
      setEndorseSuggestionClicked,
      setDiscardSuggestionClicked,
      userQuestionAboutSuggestion,
      setSuggestionClicked,
      setShowSuggestionPaginationPanel,
      setGenerate,
      generate,
      userQuestionAboutSuggestion,
      setIsGenerateWithoutQuestionLoading,
      setIsgenerateClicked,
      setIsGenerateWithQuestionLoading,
      setIsRecomendationRegenerateLoading,
      setGenerate,
      suggestionPaginationRegenerate
    ]
  )

  // get initial state
  useEffect(() => {
    vscode.postMessage({ type: 'getInitData' })

    const interval = setInterval(() => {
      vscode.postMessage({ type: 'getInitData' })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
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
    userQuestionAboutRecomendation,
    setUserQuestionAboutRecomendation,
    isRecomendationRegenerateLoading,
    setIsRecomendationRegenerateLoading,
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
