import { Button, ButtonGroup } from '@mui/material';
import React from 'react';

interface FeedbackProps {
  handleDiscardClick: React.MouseEventHandler<HTMLButtonElement>;
  handleEndorseClick: React.MouseEventHandler<HTMLButtonElement>;
}
export const Feedback = ({
  handleDiscardClick,
  handleEndorseClick,
}: FeedbackProps): JSX.Element => {
  return (
    <>
      <ButtonGroup variant='outlined' size='large' aria-label='large button group'>
        <Button
          onClick={handleDiscardClick}
          variant='contained'
          color='primary'
          sx={{ borderRadius: '8px', fontSize: '8px', padding: '8px 16px' }}
        >
          Discard
        </Button>
        <Button
          onClick={handleEndorseClick}
          variant='contained'
          color='primary'
          sx={{ borderRadius: '8px', fontSize: '8px', padding: '8px 16px' }}
        >
          <svg
            width='19'
            height='16'
            viewBox='0 0 19 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M0 16H3.45455V6.4H0V16ZM19 7.2C19 6.32 18.2227 5.6 17.2727 5.6H11.8232L12.6436 1.944L12.6695 1.688C12.6695 1.36 12.5227 1.056 12.2895 0.84L11.3741 0L5.69136 5.272C5.37182 5.56 5.18182 5.96 5.18182 6.4V14.4C5.18182 15.28 5.95909 16 6.90909 16H14.6818C15.3986 16 16.0118 15.6 16.2709 15.024L18.8791 9.384C18.9568 9.2 19 9.008 19 8.8V7.2Z'
              fill='#EFEFEF'
            />
          </svg>
        </Button>
      </ButtonGroup>
    </>
  );
};
