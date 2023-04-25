import * as React from 'react'
import { Header } from './Header'
import './App.css'

const App = () => {
  return (
    <>
      <Header />
      <PaginatePanel />
      <ProblemFeedback />
    </>
  )
}

export default App
