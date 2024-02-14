import { useRecoilValue } from 'recoil';
import { Box, CircularProgress, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { ProblemList } from './ProblemList';
import { AnalyzePageBodyContainer } from './styles';
import * as State from '../../state';
import { useMemo } from 'react';

interface AnalyzeProps {
  hasWorkSpaceFolders: boolean;
  hasOpenTextDocuments: boolean;
  isAnalysisLoading: boolean;
  handleAnalyzeClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const AnalyzePage = ({
  hasWorkSpaceFolders,
  hasOpenTextDocuments,
  isAnalysisLoading,
  handleAnalyzeClick,
}: AnalyzeProps): JSX.Element => {
  const theme = useTheme();

  const identifiedProblems = useRecoilValue(State.identifiedProblems);

  const problems = useMemo(() => {
    if (!identifiedProblems) return undefined;

    return Object.keys(identifiedProblems)
      .filter(problemKey => {
        const problem = identifiedProblems[problemKey];

        return !problem.isDiscarded;
      })
      .map(problemKey => {
        const problem = identifiedProblems[problemKey];

        return {
          name: problem.path,
        };
      });
  }, [identifiedProblems]);

  return (
    <>
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
              disabled={isAnalysisLoading}
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

      {problems && hasWorkSpaceFolders && hasOpenTextDocuments && (
        <ProblemList problems={problems} />
      )}
    </>
  );
};
