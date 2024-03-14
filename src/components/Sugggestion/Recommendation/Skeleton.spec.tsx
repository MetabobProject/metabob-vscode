import { RenderResult, render } from '@testing-library/react';
import { RecommendationSkeletonLoader } from './Skeleton';

describe('RecommendationSkeletonLoader', () => {
  it('renders without crashing', () => {
    const { getByTestId }: RenderResult = render(<RecommendationSkeletonLoader />);
    const skeletonElement = getByTestId('recommendation-skeleton');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('renders a Skeleton component with 100% width', () => {
    const { getByTestId }: RenderResult = render(<RecommendationSkeletonLoader />);
    const skeletonElement = getByTestId('recommendation-skeleton');
    expect(skeletonElement).toBeInTheDocument();
    expect(skeletonElement).toHaveStyle('width: 100%');
  });

  it('renders a Skeleton component with 100px height', () => {
    const { getByTestId }: RenderResult = render(<RecommendationSkeletonLoader />);
    const skeletonElement = getByTestId('recommendation-skeleton');
    expect(skeletonElement).toBeInTheDocument();
    expect(skeletonElement).toHaveStyle('height: 100px');
  });
});
