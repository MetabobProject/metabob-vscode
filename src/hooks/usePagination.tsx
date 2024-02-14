import { useCallback, useState } from 'react';
import { RecommendationPayload } from '../types';

export const usePagination = (
  data: RecommendationPayload[] | undefined,
): {
  currentPage: number;
  totalPages: number;
  currentData: RecommendationPayload | undefined;
  goToNextPage: () => void;
  goToPrevPage: () => void;
} => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = data?.length || 0;

  const currentData = data?.[currentPage] || undefined;

  const goToNextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages - 1));
  }, [setCurrentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
  }, [setCurrentPage]);

  return {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPrevPage,
  };
};
