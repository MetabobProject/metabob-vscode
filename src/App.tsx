import * as React from 'react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { Box, CircularProgress, CssBaseline, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import { ExtensionSVG } from './components';
import { AccountSettingProvider } from './context/UserContext';
import { Layout } from './layout/Layout';
import { muiThemeDark } from './theme';
import * as State from './state';

const AppLayout = (): JSX.Element => {
  const theme = useTheme();
  const [isAnalysisLoading, setIsAnalysisLoading] = useRecoilState(State.isAnalysisLoading);
  const hasWorkSpaceFolders = useRecoilValue(State.hasWorkSpaceFolders);
  const hasOpenTextDocuments = useRecoilValue(State.hasOpenTextDocuments);

  const handleDocsClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(async e => {
    e.preventDefault();
    vscode.postMessage({
      type: 'open_external_link',
      data: {
        url: 'https://marketplace.visualstudio.com/items?itemName=Metabob.metabob',
      },
    });
  }, []);

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

  return (
    <>
      <Layout>
        <Button
          sx={{
            alignSelf: 'flex-end',
          }}
          variant='contained'
          color='primary'
          onClick={handleDocsClick}
        >
          Docs
        </Button>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ExtensionSVG />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(20),
          }}
        >
          {(!hasWorkSpaceFolders || !hasOpenTextDocuments) && (
            <>
              <Button
                sx={{
                  width: '100%',
                }}
                variant='contained'
                color='primary'
                disabled
              >
                Please open a project to analyze
              </Button>
            </>
          )}

          {hasWorkSpaceFolders && hasOpenTextDocuments && (
            <>
              <Button
                sx={{
                  minWidth: '120px',
                }}
                variant='contained'
                color='primary'
                onClick={handleAnalyzeClick}
              >
                {isAnalysisLoading && (
                  <CircularProgress
                    size={15}
                    sx={{
                      marginRight: '10px',
                      color: 'whitesmoke',
                    }}
                  />
                )}
                Analyze
              </Button>
            </>
          )}
        </Box>
      </Layout>
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
