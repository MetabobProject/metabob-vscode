import * as React from 'react'
import { Header } from './Header'
import './App.css'
import { AccountSettingProvider } from './context/UserContext'
import { SuggestionPaginatePanel } from './SuggestionPaginatePanel'
import { ProblemFeedback } from './ProblemFeedback'
import { QuestionPanel } from './QuestionPanel'
import { RecomendationPanel } from './RecomendationPanel'
import { Layout } from './Layout'

const App = () => {
  return (
    <>
      <AccountSettingProvider>
        <Layout>
          <Header />
          <SuggestionPaginatePanel />
          <ProblemFeedback />
          <QuestionPanel />
          <RecomendationPanel />
        </Layout>
      </AccountSettingProvider>
    </>
  )
}

export default App
