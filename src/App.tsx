import * as React from 'react'
import { Header } from './Header'
import './App.css'
import { AccountSettingProvider } from './context/UserContext'
import { SuggestionPaginatePanel } from './SuggestionPaginatePanel'
import { ProblemFeedback } from './ProblemFeedback'

const App = () => {
  return (
    <>
      <AccountSettingProvider>
        <Header />
        <hr className='my-12 h-0.5 border-t-0 bg-neutral-100 opacity-50 dark:opacity-50' />
        <SuggestionPaginatePanel />
        <hr className='my-12 h-0.5 border-t-0 bg-neutral-100 opacity-50 dark:opacity-50' />
        <ProblemFeedback />
        <hr className='my-12 h-0.5 border-t-0 bg-neutral-100 opacity-50 dark:opacity-50' />
      </AccountSettingProvider>
    </>
  )
}

export default App
