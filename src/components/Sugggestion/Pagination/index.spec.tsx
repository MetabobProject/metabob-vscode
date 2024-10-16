import { fireEvent, render } from '@testing-library/react';
import { RecommendationPagination, RecommendationPaginationProps } from './index';

describe('RecommendationPagination', () => {
  it('renders pagination buttons when shouldRenderPagination is true', () => {
    const props: RecommendationPaginationProps = {
      gotoNextPage: jest.fn(),
      gotoPreviousPage: jest.fn(),
      shouldRenderPagination: true,
      currentPage: 1,
      totalPages: 5,
    };
    const { getByTestId } = render(<RecommendationPagination {...props} />);
    const gotoPreviousButton = getByTestId('goto-previous-button');
    const gotoNextButton = getByTestId('goto-next-button');

    expect(gotoPreviousButton).toBeInTheDocument();
    expect(gotoNextButton).toBeInTheDocument();
  });

  it('does not render pagination buttons when shouldRenderPagination is false', () => {
    const props: RecommendationPaginationProps = {
      gotoNextPage: jest.fn(),
      gotoPreviousPage: jest.fn(),
      shouldRenderPagination: false,
      currentPage: 1,
      totalPages: 5,
    };

    const { queryByTestId } = render(<RecommendationPagination {...props} />);

    expect(queryByTestId('goto-previous-button')).toBeNull();
    expect(queryByTestId('goto-next-button')).toBeNull();
  });

  it('calls gotoNextPage when Next Page button is clicked', () => {
    const gotoNextPageMock = jest.fn();
    const props: RecommendationPaginationProps = {
      gotoNextPage: gotoNextPageMock,
      gotoPreviousPage: jest.fn(),
      shouldRenderPagination: true,
      currentPage: 1,
      totalPages: 5,
    };
    const { getByTestId } = render(<RecommendationPagination {...props} />);

    const gotoNextButton = getByTestId('goto-next-button');
    fireEvent.click(gotoNextButton);
    expect(gotoNextPageMock).toHaveBeenCalled();
  });

  it('calls gotoPreviousPage when Previous Page button is clicked', () => {
    const gotoPreviousPageMock = jest.fn();
    const props: RecommendationPaginationProps = {
      gotoNextPage: jest.fn(),
      gotoPreviousPage: gotoPreviousPageMock,
      shouldRenderPagination: true,
      currentPage: 1,
      totalPages: 5,
    };
    const { getByTestId } = render(<RecommendationPagination {...props} />);

    const gotoPreviousButton = getByTestId('goto-previous-button');
    fireEvent.click(gotoPreviousButton);
    expect(gotoPreviousPageMock).toHaveBeenCalled();
  });

  it('gotoNextPage Button is Disabled', () => {
    const props: RecommendationPaginationProps = {
      gotoNextPage: jest.fn(),
      gotoPreviousPage: jest.fn(),
      shouldRenderPagination: true,
      currentPage: 5,
      totalPages: 5,
    };

    const { getByTestId } = render(<RecommendationPagination {...props} />);

    const gotoNextButton = getByTestId('goto-next-button');
    expect(gotoNextButton).toBeInTheDocument();
    expect(gotoNextButton).toHaveAttribute('disabled');
  });

  it('gotoPrevPage Button is Disabled', () => {
    const props: RecommendationPaginationProps = {
      gotoNextPage: jest.fn(),
      gotoPreviousPage: jest.fn(),
      shouldRenderPagination: true,
      currentPage: 0,
      totalPages: 5,
    };

    const { getByTestId } = render(<RecommendationPagination {...props} />);

    const gotoPreviousButton = getByTestId('goto-previous-button');
    expect(gotoPreviousButton).toBeInTheDocument();
    expect(gotoPreviousButton).toHaveAttribute('disabled');
  });
});
