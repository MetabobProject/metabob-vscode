import { Box, CircularProgress, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { ExtensionSVG } from '../ExtensionSVG';
import { ProblemList } from './ProblemList';
import {
  AnalyzePageButtonHeader,
  AnalyzePageSvgContainer,
  AnalyzePageBodyContainer,
} from './styles';

interface AnalyzeProps {
  hasWorkSpaceFolders: boolean;
  hasOpenTextDocuments: boolean;
  isAnalysisLoading: boolean;
  handleDocsClick: React.MouseEventHandler<HTMLButtonElement>;
  handleAnalyzeClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const AnalyzePage = ({
  hasWorkSpaceFolders,
  hasOpenTextDocuments,
  isAnalysisLoading,
  handleDocsClick,
  handleAnalyzeClick,
}: AnalyzeProps): JSX.Element => {
  const theme = useTheme();

  const problems = [{ name: 'app.py' }, { name: 'cli.py' }];

  return (
    <>
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
      <Box sx={AnalyzePageBodyContainer(theme)}>
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
                minWidth: '140px',
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
      <ProblemList problems={problems} />
    </>
  );
};
