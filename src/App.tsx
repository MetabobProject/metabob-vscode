import * as React from 'react'
import { RecoilRoot, useRecoilValue } from 'recoil'
import { Header } from './Header'
import { AccountSettingProvider } from './context/UserContext'
import { SuggestionPaginatePanel } from './panels/SuggestionPaginatePanel'
import { ProblemFeedback } from './panels/ProblemFeedback'
import { QuestionPanel } from './panels/QuestionPanel'
import { RecommendationPanel } from './panels/RecommendationPanel'
import { Layout } from './layout/Layout'
import { useUser } from './hooks/useUser'
import { ExtensionSVG, Button, ButtonWidth } from './components'
import * as State from './state'

const AppLayout = (): JSX.Element => {
  const { initialState } = useUser()
  const isActiveDetected = initialState?.vuln !== undefined ? true : false

  const hasWorkSpaceFolders = useRecoilValue(State.hasWorkSpaceFolders)
  const hasOpenTextDocuments = useRecoilValue(State.hasOpenTextDocuments)

  const handleDocsClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(async e => {
    e.preventDefault()
    vscode.postMessage({
      type: 'open_external_link',
      data: {
        url: 'https://marketplace.visualstudio.com/items?itemName=Metabob.metabob'
      }
    })
  }, [])

  const handleAnalyzeClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(e => {
    e.preventDefault()

    return
  }, [])

  if (!isActiveDetected) {
    return (
      <>
        <Layout>
          <div className='flex justify-end'>
            <Button label='Docs' handleClick={handleDocsClick} isBoldText />
          </div>
          <div className='flex items-center justify-center'>
            <div className='relative'>
              <ExtensionSVG />
              {!hasWorkSpaceFolders && !hasOpenTextDocuments && (
                <>
                  <div className='flex justify-center px-4 py-2'>
                    <Button
                      label='Please open a project to analyze'
                      handleClick={() => {
                        return
                      }}
                      width={ButtonWidth.Medium}
                      isBoldText
                      disabled
                    />
                  </div>
                </>
              )}

              {hasWorkSpaceFolders && hasOpenTextDocuments && (
                <>
                  <div className='flex justify-center px-4 py-2'>
                    <Button label='Analyze' handleClick={handleAnalyzeClick} width={ButtonWidth.Medium} isBoldText />
                  </div>
                </>
              )}
            </div>
          </div>
        </Layout>
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
      <RecoilRoot>
        <AccountSettingProvider>
          <AppLayout />
        </AccountSettingProvider>
      </RecoilRoot>
    </>
  )
}

export default App
