import * as React from 'react'
import { Header } from './Header'
import { AccountSettingProvider } from './context/UserContext'
import { SuggestionPaginatePanel } from './panels/SuggestionPaginatePanel'
import { ProblemFeedback } from './panels/ProblemFeedback'
import { QuestionPanel } from './panels/QuestionPanel'
import { RecommendationPanel } from './panels/RecommendationPanel'
import { Layout } from './layout/Layout'
import { useUser } from './hooks/useUser'

const AppLayout = (): JSX.Element => {
  const { initialState } = useUser()
  const isActiveDetected = initialState?.vuln !== undefined ? true : false

  if (!isActiveDetected) {
    return (
      <>
        <div>
          <span className='antialiased whitespace-pre-wrap'>The selected problem's details will appear here</span>
        </div>
      </>
    )
  }

  return (
    <Layout>
      <Header />
      <SuggestionPaginatePanel />
      <ProblemFeedback />
      <QuestionPanel />
      <RecommendationPanel />
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
