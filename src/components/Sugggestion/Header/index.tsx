import { Box, Typography } from '@mui/material';

interface HeaderProps {
  category?: string;
  description?: string;
}

export const Header = ({ category, description }: HeaderProps): JSX.Element => {
  return (
    <>
      {category && (
        <Box width='100%'>
          <Typography component='span' variant='subtitle1' color='whitesmoke' fontWeight={600}>
            Problem Category:
          </Typography>{' '}
          <Typography variant='body1' display='inline' color='whitesmoke'>
            {category}
          </Typography>
        </Box>
      )}

      {description && (
        <Box width='100%'>
          <Typography variant='subtitle1' component='span' fontWeight={600} color='whitesmoke'>
            Problem Description:
          </Typography>{' '}
          <Typography variant='body1' display='inline' color='whitesmoke'>
            {description}
          </Typography>
        </Box>
      )}
    </>
  );
};
