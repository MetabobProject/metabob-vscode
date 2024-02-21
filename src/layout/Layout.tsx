import { useRecoilState, useSetRecoilState } from 'recoil';
import { useCallback, MouseEventHandler, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { ExtensionSVG } from '../components';
import { LayoutContainer, AnalyzePageSvgContainer } from './styles';
import { BackButtonSVG } from '../components/BackButtonSVG';
import * as State from "../state";
import { ApplicationWebviewState } from "../types";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  const [applicationState, setApplicationState] = useRecoilState(State.applicationState);
  const setIdentifiedSuggestion = useSetRecoilState(State.identifiedSuggestion);

  const handleDocsClick: MouseEventHandler<HTMLButtonElement> = useCallback(async e => {
    e.preventDefault();
    vscode.postMessage({
      type: 'open_external_link',
      data: {
        url: 'https://marketplace.visualstudio.com/items?itemName=Metabob.metabob',
      },
    });
  }, []);

  const isAnalyzeMode = useMemo(() => {
    if (applicationState === ApplicationWebviewState.SUGGESTION_MODE) {
      return true
    }

    return false
  }, [applicationState]);

  const handleBackButton = useCallback(() => {
    setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
    setIdentifiedSuggestion(undefined)
  }, [setApplicationState]);

  return (
    <Box sx={LayoutContainer}>
      <Box display="flex" flexDirection='row' justifyContent={isAnalyzeMode ? 'space-between' : 'flex-end'} width='100%'>
        {isAnalyzeMode && <>
          <Button
            variant='contained'
            color='primary'
            sx={{
              alignSelf: 'flex-start'
            }}
            onClick={handleBackButton}
          >
            <BackButtonSVG />
          </Button>
        </>}
        <Button
          sx={{
            alignSelf: 'flex-end'
          }}
          variant='contained'
          color='primary'
          onClick={handleDocsClick}
        >
          Docs
        </Button>
      </Box>


      <Box sx={AnalyzePageSvgContainer}>
        <ExtensionSVG />
      </Box>

      {children}
    </Box>
  );
};
