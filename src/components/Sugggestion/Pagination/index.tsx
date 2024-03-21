import { Box, Button, ButtonGroup, SxProps } from '@mui/material';
import { useMemo } from 'react';

export interface RecommendationPaginationProps {
  gotoNextPage: () => void;
  gotoPreviousPage: () => void;
  handleApplyRecommendation: () => void;
  shouldRenderPagination: boolean;
  currentPage: number;
  totalPages: number;
}

export const RecommendationPagination = ({
  gotoNextPage,
  gotoPreviousPage,
  handleApplyRecommendation,
  shouldRenderPagination,
  currentPage,
  totalPages,
}: RecommendationPaginationProps): JSX.Element => {
  // Disable left arrow if on the first page
  const isLeftArrowDisabled = currentPage <= 0;

  // Disable right arrow if on the last page
  const isRightArrowDisabled = currentPage >= totalPages - 1;

  const leftButtonSxProps = useMemo(() => {
    if (isLeftArrowDisabled === true) {
      return {
        backgroundColor: `rgb(105,105,105) !important`,
      } as SxProps;
    }

    return {
      backgroundColor: `rgb(19, 96, 196)`,
    } as SxProps;
  }, [isLeftArrowDisabled]);

  const rightButtonSxProps = useMemo(() => {
    if (isRightArrowDisabled === true) {
      return {
        backgroundColor: `rgb(105,105,105) !important`,
      } as SxProps;
    }

    return {
      backgroundColor: `rgb(19, 96, 196)`,
    } as SxProps;
  }, [isRightArrowDisabled]);

  return (
    <>
      <Box
        display='flex'
        flexDirection='row'
        justifyContent={!shouldRenderPagination ? 'flex-end' : 'space-between'}
        marginTop='10px'
        width='100%'
      >
        {shouldRenderPagination && (
          <ButtonGroup
            variant='contained'
            sx={{
              justifyContent: 'flex-start',
            }}
          >
            <Button
              data-testid='goto-previous-button'
              color='primary'
              onClick={gotoPreviousPage}
              disabled={isLeftArrowDisabled}
              sx={leftButtonSxProps}
            >
              <svg
                width='25'
                height='8'
                viewBox='0 0 25 8'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M0.646447 3.64645C0.451184 3.84171 0.451184 4.15829 0.646447 4.35355L3.82843 7.53553C4.02369 7.7308 4.34027 7.7308 4.53553 7.53553C4.7308 7.34027 4.7308 7.02369 4.53553 6.82843L1.70711 4L4.53553 1.17157C4.7308 0.976311 4.7308 0.659728 4.53553 0.464466C4.34027 0.269204 4.02369 0.269204 3.82843 0.464466L0.646447 3.64645ZM1 4.5H25V3.5H1V4.5Z'
                  fill='#EFEFE6'
                />
              </svg>
            </Button>
            <Button
              data-testid='goto-next-button'
              color='primary'
              onClick={gotoNextPage}
              disabled={isRightArrowDisabled}
              sx={rightButtonSxProps}
            >
              <svg
                width='25'
                height='8'
                viewBox='0 0 25 8'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M24.3536 4.35355C24.5488 4.15829 24.5488 3.84171 24.3536 3.64645L21.1716 0.464466C20.9763 0.269204 20.6597 0.269204 20.4645 0.464466C20.2692 0.659728 20.2692 0.976311 20.4645 1.17157L23.2929 4L20.4645 6.82843C20.2692 7.02369 20.2692 7.34027 20.4645 7.53553C20.6597 7.7308 20.9763 7.7308 21.1716 7.53553L24.3536 4.35355ZM0 4.5H24V3.5H0V4.5Z'
                  fill='#EFEFE6'
                />
              </svg>
            </Button>
          </ButtonGroup>
        )}

        <Button
          data-testid='apply-button'
          variant='contained'
          sx={{
            justifyContent: 'flex-end',
          }}
          onClick={handleApplyRecommendation}
        >
          Apply
        </Button>
      </Box>
    </>
  );
};
