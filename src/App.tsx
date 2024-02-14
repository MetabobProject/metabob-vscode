import * as React from 'react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AnalyzePage, SuggestionPage } from './components';
import { AccountSettingProvider } from './context/UserContext';
import { Layout } from './layout/Layout';
import { muiThemeDark } from './theme';
import * as State from './state';
import { ApplicationWebviewState } from './types';

const AppLayout = (): JSX.Element => {
  const [isAnalysisLoading, setIsAnalysisLoading] = useRecoilState(State.isAnalysisLoading);
  const hasWorkSpaceFolders = useRecoilValue(State.hasWorkSpaceFolders);
  const hasOpenTextDocuments = useRecoilValue(State.hasOpenTextDocuments);
  const applicationState = useRecoilValue(State.applicationState);

  const handleAnalyzeClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    e => {
      e.preventDefault();
      if (hasWorkSpaceFolders && hasOpenTextDocuments) {
        vscode.postMessage({
          type: 'analysis_current_file',
        });
        setIsAnalysisLoading(true);
      }
    },
    [hasWorkSpaceFolders, hasOpenTextDocuments, setIsAnalysisLoading],
  );

  const renderApplicationBasedOnState = React.useMemo(() => {
    switch (applicationState) {
      case ApplicationWebviewState.ANALYZE_MODE:
        return (
          <>
            <AnalyzePage
              handleAnalyzeClick={handleAnalyzeClick}
              isAnalysisLoading={isAnalysisLoading}
              hasWorkSpaceFolders={hasWorkSpaceFolders}
              hasOpenTextDocuments={hasOpenTextDocuments}
            />
          </>
        );
      case ApplicationWebviewState.SUGGESTION_MODE:
        return <SuggestionPage />;
      default:
        return <></>;
    }
  }, [
    applicationState,
    handleAnalyzeClick,
    isAnalysisLoading,
    hasWorkSpaceFolders,
    hasOpenTextDocuments,
  ]);

  return (
    <>
      <Layout>{renderApplicationBasedOnState}</Layout>
    </>
  );
};

const App = (): JSX.Element => {
  return (
    <>
      <RecoilRoot>
        <AccountSettingProvider>
          <ThemeProvider theme={muiThemeDark}>
            <AppLayout />
            <CssBaseline />
          </ThemeProvider>
        </AccountSettingProvider>
      </RecoilRoot>
    </>
  );
};

export default App;
