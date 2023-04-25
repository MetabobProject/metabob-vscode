// ** React Imports
import { createContext, useState, ReactNode, useCallback, useEffect } from 'react'

// ** Services
import { AccountSettingTypes, MessageType } from '../types'

// ** Defaults
const defaultProvider: AccountSettingTypes = {
  initialState: {},
  suggestion: '',
  generate: '',
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
  setIsGenerateWithoutQuestionLoading: () => Boolean
}

const AccountSettingContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AccountSettingProvider = ({ children }: Props) => {
  const [initialState, setInitialState] = useState('')
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

  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<MessageType>) => {
      const payload = event.data.data
      switch (event.data.type) {
        case 'initData':
          setInitialState({ ...payload })
          break
        case 'onSuggestionClicked:Response':
          const { description } = payload
          setSuggestion(description)
          setShowSuggestionPaginationPanel(true)
          setSuggestionClicked(false)
          break
        case 'onSuggestionClickedGPT:Response':
          setSuggestionClicked(false)
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
          setIsGenerateWithoutQuestionLoading(false)
          setGenerate(`~~~python\n${recommendation}~~~`)
          setIsgenerateClicked(true)
          break
        case 'onGenerateClicked:Error':
          setGenerate('')
          setIsGenerateWithoutQuestionLoading(false)
          setIsgenerateClicked(false)
          break
        case 'onSuggestionClicked:Error':
          setShowSuggestionPaginationPanel(false)
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
    [setInitialState, setSuggestion, setEndorseSuggestionClicked, setDiscardSuggestionClicked]
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
    generate,
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
    setIsGenerateWithoutQuestionLoading
  }

  return <AccountSettingContext.Provider value={values}>{children}</AccountSettingContext.Provider>
}

export { AccountSettingContext, AccountSettingProvider }
