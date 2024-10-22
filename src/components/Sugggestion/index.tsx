import { useCallback, MouseEventHandler, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as State from '../../state';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { Box, Button, CircularProgress, SxProps } from '@mui/material';
import { feedbackContainer, generateRecommendationButtonContainer } from './styles';
import { RecommendationSkeletonLoader } from './Recommendation/Skeleton';
import { RecommendationPagination } from './Pagination';

export const SuggestionPage = (): JSX.Element => {
  const suggestion = useRecoilValue(State.identifiedSuggestion);
  const recommendationCount = useRecoilValue(State.recommendationCount);
  const recommendationCurrent = useRecoilValue(State.recommendationCurrent);

  const goToNextPage = (): void => {
    if (recommendationCurrent === undefined) return;
    vscode.postMessage({
      type: 'goToRecommendationIdx',
      data: recommendationCurrent + 1,
    });
  };
  const goToPrevPage = (): void => {
    if (recommendationCurrent === undefined) return;
    vscode.postMessage({
      type: 'goToRecommendationIdx',
      data: recommendationCurrent - 1,
    });
  };

  const [isRecommendationLoading, setIsRecommendationLoading] = useRecoilState(
    State.isRecommendationLoading,
  );

  useEffect(() => {
    if (!suggestion) return;

    const isFix = suggestion.isFix;
    const isReset = suggestion.isReset;

    if (isFix === true && isReset === false) {
      vscode.postMessage({
        type: 'onGenerateClicked',
        data: {
          input: '',
          initData: suggestion,
        },
      });

      setIsRecommendationLoading(true);
    }
  }, [suggestion, setIsRecommendationLoading]);

  const handleDiscardClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.preventDefault();
      vscode.postMessage({
        type: 'onDiscardSuggestionClicked',
        data: {
          initData: { ...suggestion },
        },
      });
    },
    [suggestion],
  );

  const handleEndorseClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.preventDefault();
      vscode.postMessage({
        type: 'onEndorseSuggestionClicked',
        data: {
          initData: { ...suggestion },
        },
      });
    },
    [suggestion],
  );

  const handleGenerateRecommendation: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.preventDefault();

      if (suggestion) {
        vscode.postMessage({
          type: 'onGenerateClicked',
          data: {
            input: '',
            initData: suggestion,
          },
        });

        setIsRecommendationLoading(true);
      }
    },
    [suggestion, setIsRecommendationLoading],
  );

  const categoryMemo = useMemo(() => {
    return suggestion?.vuln?.category;
  }, [suggestion]);

  const descriptionMemo = useMemo(() => {
    return suggestion?.vuln?.description;
  }, [suggestion]);

  const shouldRenderPagination = recommendationCount > 1 && recommendationCurrent !== undefined;

  const hasRecommendation = recommendationCount > 0;

  const generateButtonSxProps = useMemo(() => {
    if (!suggestion || isRecommendationLoading) {
      return {
        color: 'whitesmoke',
        backgroundColor: `rgb(105,105,105) !important`,
      } as SxProps;
    }

    return {
      color: 'whitesmoke',
      backgroundColor: `rgb(19, 96, 196)`,
    } as SxProps;
  }, [suggestion, isRecommendationLoading]);

  return (
    <>
      <Header category={categoryMemo} description={descriptionMemo} />
      <Box sx={feedbackContainer}>
        <Feedback handleDiscardClick={handleDiscardClick} handleEndorseClick={handleEndorseClick} />
      </Box>
      <Box sx={generateRecommendationButtonContainer}>
        <Button
          data-testid='generate-recommendation-button'
          size='large'
          variant='contained'
          sx={generateButtonSxProps}
          onClick={handleGenerateRecommendation}
          disabled={!suggestion || isRecommendationLoading}
        >
          {isRecommendationLoading && (
            <>
              <CircularProgress
                data-testid='recommendation_loading_spinner'
                size={15}
                sx={{
                  marginRight: '10px',
                  color: 'whitesmoke',
                }}
              />
            </>
          )}
          {hasRecommendation ? 'ReGenerate' : 'Generate'} Recommendation
        </Button>
      </Box>

      {!hasRecommendation && isRecommendationLoading && (
        <Box
          width='100%'
          maxHeight='100px'
          sx={{
            marginTop: '20px',
          }}
        >
          <RecommendationSkeletonLoader />
        </Box>
      )}

      {shouldRenderPagination && (
        <>
          <RecommendationPagination
            gotoNextPage={goToNextPage}
            gotoPreviousPage={goToPrevPage}
            shouldRenderPagination={shouldRenderPagination}
            currentPage={recommendationCurrent}
            totalPages={recommendationCount}
          />
        </>
      )}
    </>
  );
};
