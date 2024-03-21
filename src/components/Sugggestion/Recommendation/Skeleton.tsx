import { Skeleton } from '@mui/material';

export const RecommendationSkeletonLoader = (): JSX.Element => {
  return (
    <Skeleton data-testid='recommendation-skeleton' variant='rounded' width='100%' height='100px' />
  );
};
