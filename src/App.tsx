import * as React from 'react'
import { Header } from './Header'
import './App.css'
import { AccountSettingProvider } from './context/UserContext'
import { SuggestionPaginatePanel } from './SuggestionPaginatePanel'
import { ProblemFeedback } from './ProblemFeedback'
import { QuestionPanel } from './QuestionPanel'
import { RecomendationPanel } from './RecomendationPanel'

const App = () => {
  return (
    <>
      <AccountSettingProvider>
        <Header />
        <SuggestionPaginatePanel />
        <ProblemFeedback />
        <QuestionPanel />
        <RecomendationPanel />
      </AccountSettingProvider>
    </>
  )
}

export default App
