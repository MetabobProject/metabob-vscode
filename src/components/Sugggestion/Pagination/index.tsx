import { Box, Button, ButtonGroup } from '@mui/material';

export const RecommendationPagination = (): JSX.Element => {
  return (
    <>
      <Box
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        marginTop='10px'
        width='100%'
      >
        <ButtonGroup
          variant='contained'
          sx={{
            justifyContent: 'flex-start',
          }}
        >
          <Button>Left</Button>
          <Button>Right</Button>
        </ButtonGroup>
        <Button
          variant='contained'
          sx={{
            justifyContent: 'flex-end',
          }}
        >
          Apply
        </Button>
      </Box>
    </>
  );
};
