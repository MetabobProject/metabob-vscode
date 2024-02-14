import { useCallback, MouseEventHandler } from 'react';
import { Box, Button } from '@mui/material';
import { ExtensionSVG } from '../components';
import { AnalyzePageButtonHeader, LayoutContainer, AnalyzePageSvgContainer } from './styles';

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  const handleDocsClick: MouseEventHandler<HTMLButtonElement> = useCallback(async e => {
    e.preventDefault();
    vscode.postMessage({
      type: 'open_external_link',
      data: {
        url: 'https://marketplace.visualstudio.com/items?itemName=Metabob.metabob',
      },
    });
  }, []);

  return (
    <Box sx={LayoutContainer}>
      <Button
        sx={AnalyzePageButtonHeader}
        variant='contained'
        color='primary'
        onClick={handleDocsClick}
      >
        Docs
      </Button>

      <Box sx={AnalyzePageSvgContainer}>
        <ExtensionSVG />
      </Box>

      {children}
    </Box>
  );
};
