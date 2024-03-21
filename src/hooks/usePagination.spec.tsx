import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';
import { RecommendationPayload } from '../types';

const mockData: RecommendationPayload[] = [
  { recommendation: 'Recommendation 1' },
  { recommendation: 'Recommendation 2' },
  { recommendation: 'Recommendation 3' },
];

describe('usePagination', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePagination(mockData));

    expect(result.current.currentPage).toBe(0);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentData).toEqual(mockData[0]);
  });

  it('should navigate to next page correctly', () => {
    const { result, rerender } = renderHook(() => usePagination(mockData));

    act(() => {
      result.current.goToNextPage();
      rerender();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.currentData).toEqual(mockData[1]);
  });

  it('should navigate to previous page correctly', () => {
    const { result, rerender } = renderHook(() => usePagination(mockData));

    act(() => {
      result.current.goToNextPage();
      rerender();
    });

    act(() => {
      result.current.goToPrevPage();
      rerender();
    });

    expect(result.current.currentPage).toBe(0);
    expect(result.current.currentData).toEqual(mockData[0]);
  });

  it('should not allow navigating beyond last page', () => {
    const { result, rerender } = renderHook(() => usePagination(mockData));

    act(() => {
      result.current.goToNextPage();
      rerender();
      result.current.goToNextPage();
      rerender();
      result.current.goToNextPage();
      rerender();
    });

    expect(result.current.currentPage).toBe(2); // Last page
    expect(result.current.currentData).toEqual(mockData[2]);
  });

  it('should not allow navigating before first page', () => {
    const { result, rerender } = renderHook(() => usePagination(mockData));

    act(() => {
      result.current.goToPrevPage();
      rerender();
    });

    expect(result.current.currentPage).toBe(0); // First page
    expect(result.current.currentData).toEqual(mockData[0]);
  });
});
