import { useCallback, MouseEventHandler, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as State from '../../state';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { Box, Button, CircularProgress } from '@mui/material';
import {
  generateRecommendationButton,
  feedbackContainer,
  generateRecommendationButtonContainer,
} from './styles';
import { Recommendation } from './Recommendation';
import { RecommendationSkeletonLoader } from './Recommendation/Skeleton';
import { RecommendationPagination } from './Pagination';

export const SuggestionPage = (): JSX.Element => {
  const suggestion = useRecoilValue(State.identifiedSuggestion);
  const recommendation = useRecoilValue(State.identifiedRecommendation);

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

  const handleDiscardClick: MouseEventHandler<HTMLButtonElement> = useCallback(e => {
    e.preventDefault();
    vscode.postMessage({
      type: 'onDiscardSuggestionClicked',
      data: {
        initData: { ...suggestion },
      },
    });
  }, []);

  const handleEndorseClick: MouseEventHandler<HTMLButtonElement> = useCallback(e => {
    e.preventDefault();
    vscode.postMessage({
      type: 'onEndorseSuggestionClicked',
      data: {
        initData: { ...suggestion },
      },
    });
  }, []);

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

  const recommendationMemo = useMemo(() => {
    return recommendation?.recommendation;
  }, [recommendation]);

  return (
    <>
      <Header category={categoryMemo} description={descriptionMemo} />
      <Box sx={feedbackContainer}>
        <Feedback handleDiscardClick={handleDiscardClick} handleEndorseClick={handleEndorseClick} />
      </Box>
      <Box sx={generateRecommendationButtonContainer}>
        <Button
          size='large'
          variant='contained'
          sx={generateRecommendationButton}
          onClick={handleGenerateRecommendation}
          disabled={!suggestion || isRecommendationLoading}
        >
          {isRecommendationLoading && (
            <>
              <CircularProgress
                size={15}
                sx={{
                  marginRight: '10px',
                  color: 'whitesmoke',
                }}
              />
            </>
          )}
          Generate Recommendation
        </Button>
      </Box>

      {!recommendation && isRecommendationLoading && (
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

      {recommendationMemo && (
        <>
          <Box width='100%' height='40%' overflow='scroll' marginTop='12px'>
            <Recommendation text={recommendationMemo} />
          </Box>
          <RecommendationPagination />
        </>
      )}
    </>
  );
};
