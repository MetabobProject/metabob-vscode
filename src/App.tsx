import * as React from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import { ExtensionSVG } from './components';
import { AccountSettingProvider } from './context/UserContext';
import { Layout } from './layout/Layout';
import { muiThemeDark } from './theme';
import * as State from './state';
import { Box, CssBaseline, useTheme } from '@mui/material';

const AppLayout = (): JSX.Element => {
  const theme = useTheme();
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
      }
    },
    [hasWorkSpaceFolders, hasOpenTextDocuments],
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
            marginTop: theme.spacing(2),
          }}
        >
          {(!hasWorkSpaceFolders || !hasOpenTextDocuments) && (
            <>
              <div className='flex justify-center px-4 py-2'>
                <Button variant='contained' disabled>
                  Please open a project to analyze
                </Button>
              </div>
            </>
          )}

          {hasWorkSpaceFolders && hasOpenTextDocuments && (
            <>
              <div className='flex justify-center px-4 py-2'>
                <Button variant='contained' onClick={handleAnalyzeClick}>
                  Analyze
                </Button>
              </div>
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
      <AccountSettingProvider>
        <ThemeProvider theme={muiThemeDark}>
          <RecoilRoot>
            <AppLayout />
          </RecoilRoot>
          <CssBaseline />
        </ThemeProvider>
      </AccountSettingProvider>
    </>
  );
};

export default App;
