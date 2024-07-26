import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { CircularProgress, Stack, SxProps, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { ProblemList } from './ProblemList';
import { AnalyzePageBodyContainer } from './styles';
import * as State from '../../state';

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

  const analyzeState = useRecoilValue(State.analyzeState);
  const currentEditor = useRecoilValue(State.currentEditor);
  const currentWorkSpaceProject = useRecoilValue(State.currentWorkSpaceProject);
  const isEmptyIdentifiedProblemDetected = useRecoilValue(State.isEmptyIdentifiedProblemDetected);

  const otherFileWithProblems: Array<{ name: string; path: string }> | undefined = useMemo(() => {
    if (!analyzeState) return undefined;

    if (!currentEditor) return undefined;

    const results: Array<string> = Object.keys(analyzeState)
      .filter(path => path !== currentEditor)
      .filter(path => analyzeState[path][0].isValid)
      .filter(path => {
        // Check if there are any viable and undiscarded problems in the file
        for (const problem of analyzeState[path][0].problems) {
          if (problem.endLine - 1 >= 0 && problem.startLine - 1 >= 0 && !problem.discarded) {
            return true;
          }
        }

        return false;
      });

    const uniqueFiles = Array.from(new Set(results));

    return uniqueFiles.map(file => {
      return {
        path: file,
        name: file.split(/\/|\\/g).pop() || '',
      };
    });
  }, [analyzeState, currentEditor, currentWorkSpaceProject]);

  const detectedProblems = useMemo(() => {
    if (!currentEditor) return undefined;

    if (
      !analyzeState?.[currentEditor] ||
      analyzeState[currentEditor].length === 0 ||
      !analyzeState[currentEditor][0].isValid
    )
      return undefined;

    return analyzeState[currentEditor][0].problems.filter(
      problem => problem.startLine - 1 >= 0 && problem.endLine - 1 >= 0 && !problem.discarded,
    ).length;
  }, [analyzeState, currentEditor, currentWorkSpaceProject]);

  const analyzeButtonDisabledSxProps = useMemo(() => {
    if (isAnalysisLoading === true) {
      return {
        minWidth: '140px',
        backgroundColor: `rgb(105,105,105) !important`,
      } as SxProps;
    }

    return {
      minWidth: '140px',
      backgroundColor: `rgb(19, 96, 196)`,
    } as SxProps;
  }, [isAnalysisLoading]);

  const hasWorkSpaceFoldersButtonSxProps = useMemo(() => {
    return {
      width: '100%',
      backgroundColor: `rgb(105,105,105) !important`,
    } as SxProps;
  }, []);

  const showViewPreviousResultsButton: boolean =
    !!currentEditor &&
    !!analyzeState?.[currentEditor] &&
    ((analyzeState[currentEditor].length > 0 && !analyzeState[currentEditor][0].isValid) ||
      analyzeState[currentEditor].length > 1);

  const handleViewPreviousResults: React.MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    vscode.postMessage({
      type: 'view_previous_results',
      data: { path: currentEditor },
    });
  };

  return (
    <>
      <Stack spacing={2} sx={AnalyzePageBodyContainer(theme)}>
        {(!hasWorkSpaceFolders || !hasOpenTextDocuments) && (
          <>
            <Button
              sx={hasWorkSpaceFoldersButtonSxProps}
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
              sx={analyzeButtonDisabledSxProps}
              variant='contained'
              color='primary'
              onClick={handleAnalyzeClick}
              disabled={isAnalysisLoading}
            >
              {isAnalysisLoading && (
                <CircularProgress
                  data-testid='progress-bar'
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

        {showViewPreviousResultsButton && (
          <Button variant='contained' onClick={handleViewPreviousResults}>
            View Previous Results
          </Button>
        )}
      </Stack>

      {hasWorkSpaceFolders && hasOpenTextDocuments && (
        <ProblemList
          detectedProblems={detectedProblems}
          otherFileWithProblems={otherFileWithProblems}
          isEmptyIdentifiedProblemDetected={isEmptyIdentifiedProblemDetected}
        />
      )}
    </>
  );
};
