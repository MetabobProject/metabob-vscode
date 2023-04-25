import * as React from 'react'
import { Header } from './Header'
import './App.css'
import { AccountSettingProvider } from './context/UserContext'

const App = () => {
  return (
    <>
      <AccountSettingProvider>
        <Header />
        <PaginatePanel />
        <ProblemFeedback />
      </AccountSettingProvider>
    </>
  )
}

export default App
