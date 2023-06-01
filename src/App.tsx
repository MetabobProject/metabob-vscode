import * as React from 'react'
import { Header } from './Header'
import './App.css'
import { AccountSettingProvider } from './context/UserContext'
import { SuggestionPaginatePanel } from './SuggestionPaginatePanel'
import { ProblemFeedback } from './ProblemFeedback'
import { QuestionPanel } from './QuestionPanel'
import { RecommendationPanel } from './RecommendationPanel'
import { Layout } from './Layout'
import { useUser } from './hooks/useUser'

const AppLayout = (): JSX.Element => {
  const { initialState } = useUser()
  let activeDetection = false
  initialState?.vuln !== undefined ? (activeDetection = true) : (activeDetection = false)

  return (
    <Layout>
      {!activeDetection ? (
        <>
          <div>
            <span className='antialiased whitespace-pre-wrap'>The selected problem's details will appear here</span>
          </div>
        </>
      ) : (
        <>
          <Header />
          <SuggestionPaginatePanel />
          <ProblemFeedback />
          <QuestionPanel />
          <RecommendationPanel />
        </>
      )}
    </Layout>
  )
}

const App = (): JSX.Element => {
  return (
    <>
      <AccountSettingProvider>
        <AppLayout />
      </AccountSettingProvider>
    </>
  )
}

export default App
