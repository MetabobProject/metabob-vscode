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
  setEndorseSuggestionClicked: () => Boolean
}

const AccountSettingContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AccountSettingProvider = ({ children }: Props) => {
  const [initialState, setInitialState] = useState('')
  const [showSuggestionPaginatePanel] = useState<boolean>(false)
  const [showGeneratePaginatePanel] = useState<boolean>(false)
  const [suggestion, setSuggestion] = useState('')
  const [generate, setGenerate] = useState('')
  const [discardSuggestionClicked, setDiscardSuggestionClicked] = useState(false)
  const [endorseSuggestionClicked, setEndorseSuggestionClicked] = useState(false)

  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<MessageType>) => {
      const payload = event.data.data
      console.log(payload)
      switch (event.data.type) {
        case 'initData':
          setInitialState({ ...payload })
          break
        case 'onSuggestionClicked:Response':
          setSuggestion({ ...payload })
          break
        case 'onSuggestionClickedGPT:Response':
          setSuggestion(payload.choices[0].message.content)
          break
        case 'onGenerateClickedGPT:Response':
          setGenerate(payload.choices[0].message.content)
          break
        case 'onGenerateClicked:Response':
          break
        case 'onGenerateClicked:Error':
          break
        case 'onSuggestionClicked:Error':
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
    setEndorseSuggestionClicked
  }

  return <AccountSettingContext.Provider value={values}>{children}</AccountSettingContext.Provider>
}

export { AccountSettingContext, AccountSettingProvider }
