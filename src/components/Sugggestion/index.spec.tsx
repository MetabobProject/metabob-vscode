import { useEffect } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

// Manually mock vscode
jest.mock('vscode');

import vscode from '../../__mocks__/vscode';
import { SuggestionPage } from './index';
import * as State from '../../state';
import { FixSuggestionsPayload } from '../../types';

(global as any).vscode = vscode;

// @ts-ignore
export const RecoilObserver = ({ node, onChange }) => {
  const value = useRecoilValue(node);
  useEffect(() => onChange(value), [onChange, value]);
  return null;
};

describe('SuggestionPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle discard click correctly', () => {
    const mockIdentifiedSuggestion: FixSuggestionsPayload = {
      id: 'suggestion-1',
      isFix: false,
      isReset: false,
      path: '',
      vuln: {
        id: '1',
        startLine: 2,
        endLine: 3,
        path: '',
        summary: '',
        category: 'Category',
        description: 'Description',
      },
    };

    const mockIdentifiedRecommendation = {
      'suggestion-1': [{ recommendation: 'Recommendation 1' }],
    };

    const mockIsRecommendationLoading = false;

    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedSuggestion, mockIdentifiedSuggestion);
          set(State.identifiedRecommendation, mockIdentifiedRecommendation);
          set(State.isRecommendationLoading, mockIsRecommendationLoading);
        }}
      >
        <SuggestionPage />
      </RecoilRoot>,
    );
    const discardButton = getByTestId('discard-button');
    expect(discardButton).toBeInTheDocument();
    fireEvent.click(discardButton);
    expect(vscode.postMessage).toHaveBeenCalledWith({
      type: 'onDiscardSuggestionClicked',
      data: {
        initData: { ...mockIdentifiedSuggestion },
      },
    });
  });

  it('should not render recommendation pagination when there is only one recommendation', () => {
    const mockIdentifiedSuggestionChange = jest.fn();
    const mockIdentifiedRecommendationChange = jest.fn();
    const mockIsRecommendationLoadingChange = jest.fn();

    const mockIdentifiedSuggestion: FixSuggestionsPayload = {
      id: 'suggestion-1',
      isFix: false,
      isReset: false,
      path: '',
      vuln: {
        id: '1',
        startLine: 2,
        endLine: 3,
        path: '',
        summary: '',
        category: 'Category',
        description: 'Description',
      },
    };

    const mockIdentifiedRecommendation = {
      'suggestion-1': [{ recommendation: 'Recommendation 1' }],
    };

    const mockIsRecommendationLoading = false;

    const { queryByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedSuggestion, mockIdentifiedSuggestion);
          set(State.identifiedRecommendation, mockIdentifiedRecommendation);
          set(State.isRecommendationLoading, mockIsRecommendationLoading);
        }}
      >
        <RecoilObserver
          node={State.identifiedSuggestion}
          onChange={mockIdentifiedSuggestionChange}
        />
        <RecoilObserver
          node={State.identifiedRecommendation}
          onChange={mockIdentifiedRecommendationChange}
        />
        <RecoilObserver
          node={State.isRecommendationLoading}
          onChange={mockIsRecommendationLoadingChange}
        />
        <SuggestionPage />
      </RecoilRoot>,
    );

    expect(queryByTestId('recommendation_pagination')).toBeNull();
  });

  it('should display loading spinner when generating recommendation', () => {
    const mockIdentifiedSuggestionChange = jest.fn();
    const mockIdentifiedRecommendationChange = jest.fn();
    const mockIsRecommendationLoadingChange = jest.fn();

    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.isRecommendationLoading, true);
        }}
      >
        <RecoilObserver
          node={State.identifiedSuggestion}
          onChange={mockIdentifiedSuggestionChange}
        />
        <RecoilObserver
          node={State.identifiedRecommendation}
          onChange={mockIdentifiedRecommendationChange}
        />
        <RecoilObserver
          node={State.isRecommendationLoading}
          onChange={mockIsRecommendationLoadingChange}
        />
        <SuggestionPage />
      </RecoilRoot>,
    );

    expect(getByTestId('recommendation_loading_spinner')).toBeInTheDocument();
  });

  it('should pass correct data when clicked on Endorse button', () => {
    const mockIdentifiedSuggestion: FixSuggestionsPayload = {
      id: 'suggestion-1',
      isFix: false,
      isReset: false,
      path: '',
      vuln: {
        id: '1',
        startLine: 2,
        endLine: 3,
        path: '',
        summary: '',
        category: 'Category',
        description: 'Description',
      },
    };

    const mockIdentifiedRecommendation = {
      'suggestion-1': [{ recommendation: 'Recommendation 1' }],
    };

    const mockIsRecommendationLoading = false;

    const mockIdentifiedSuggestionChange = jest.fn();
    const mockIdentifiedRecommendationChange = jest.fn();
    const mockIsRecommendationLoadingChange = jest.fn();

    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedSuggestion, mockIdentifiedSuggestion);
          set(State.identifiedRecommendation, mockIdentifiedRecommendation);
          set(State.isRecommendationLoading, mockIsRecommendationLoading);
        }}
      >
        <RecoilObserver
          node={State.identifiedSuggestion}
          onChange={mockIdentifiedSuggestionChange}
        />
        <RecoilObserver
          node={State.identifiedRecommendation}
          onChange={mockIdentifiedRecommendationChange}
        />
        <RecoilObserver
          node={State.isRecommendationLoading}
          onChange={mockIsRecommendationLoadingChange}
        />
        <SuggestionPage />
      </RecoilRoot>,
    );

    const endorseButton = getByTestId('endorse-button');
    expect(endorseButton).toBeInTheDocument();
    fireEvent.click(endorseButton);
    expect(vscode.postMessage).toHaveBeenCalledWith({
      type: 'onEndorseSuggestionClicked',
      data: {
        initData: { ...mockIdentifiedSuggestion },
      },
    });
  });

  it('should pass correct data when clicked on generate button', () => {
    const mockIdentifiedSuggestion: FixSuggestionsPayload = {
      id: 'suggestion-1',
      isFix: false,
      isReset: false,
      path: '',
      vuln: {
        id: '1',
        startLine: 2,
        endLine: 3,
        path: '',
        summary: '',
        category: 'Category',
        description: 'Description',
      },
    };

    const mockIdentifiedRecommendation = {
      'suggestion-1': [{ recommendation: 'Recommendation 1' }],
    };

    const mockIsRecommendationLoading = false;

    const mockIdentifiedSuggestionChange = jest.fn();
    const mockIdentifiedRecommendationChange = jest.fn();
    const mockIsRecommendationLoadingChange = jest.fn();

    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedSuggestion, mockIdentifiedSuggestion);
          set(State.identifiedRecommendation, mockIdentifiedRecommendation);
          set(State.isRecommendationLoading, mockIsRecommendationLoading);
        }}
      >
        <RecoilObserver
          node={State.identifiedSuggestion}
          onChange={mockIdentifiedSuggestionChange}
        />
        <RecoilObserver
          node={State.identifiedRecommendation}
          onChange={mockIdentifiedRecommendationChange}
        />
        <RecoilObserver
          node={State.isRecommendationLoading}
          onChange={mockIsRecommendationLoadingChange}
        />
        <SuggestionPage />
      </RecoilRoot>,
    );

    const generateRecommendationButton = getByTestId('generate-recommendation-button');
    expect(generateRecommendationButton).toBeInTheDocument();
    fireEvent.click(generateRecommendationButton);
    expect(vscode.postMessage).toHaveBeenCalledWith({
      type: 'onGenerateClicked',
      data: {
        input: '',
        initData: { ...mockIdentifiedSuggestion },
      },
    });
    expect(mockIsRecommendationLoadingChange).toHaveBeenCalledWith(true);
  });

  it('should run the useEffect when isFix is true and isReset is false', () => {
    const mockIdentifiedSuggestion: FixSuggestionsPayload = {
      id: 'suggestion-1',
      isFix: true,
      isReset: false,
      path: '',
      vuln: {
        id: '1',
        startLine: 2,
        endLine: 3,
        path: '',
        summary: '',
        category: 'Category',
        description: 'Description',
      },
    };

    const mockIdentifiedRecommendation = {
      'suggestion-1': [{ recommendation: 'Recommendation 1' }],
    };

    const mockIsRecommendationLoading = false;

    const mockIdentifiedSuggestionChange = jest.fn();
    const mockIdentifiedRecommendationChange = jest.fn();
    const mockIsRecommendationLoadingChange = jest.fn();

    const { rerender } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedSuggestion, mockIdentifiedSuggestion);
          set(State.identifiedRecommendation, mockIdentifiedRecommendation);
          set(State.isRecommendationLoading, mockIsRecommendationLoading);
        }}
      >
        <RecoilObserver
          node={State.identifiedSuggestion}
          onChange={mockIdentifiedSuggestionChange}
        />
        <RecoilObserver
          node={State.identifiedRecommendation}
          onChange={mockIdentifiedRecommendationChange}
        />
        <RecoilObserver
          node={State.isRecommendationLoading}
          onChange={mockIsRecommendationLoadingChange}
        />
        <SuggestionPage />
      </RecoilRoot>,
    );

    rerender(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedSuggestion, mockIdentifiedSuggestion);
          set(State.identifiedRecommendation, mockIdentifiedRecommendation);
          set(State.isRecommendationLoading, mockIsRecommendationLoading);
        }}
      >
        <RecoilObserver
          node={State.identifiedSuggestion}
          onChange={mockIdentifiedSuggestionChange}
        />
        <RecoilObserver
          node={State.identifiedRecommendation}
          onChange={mockIdentifiedRecommendationChange}
        />
        <RecoilObserver
          node={State.isRecommendationLoading}
          onChange={mockIsRecommendationLoadingChange}
        />
        <SuggestionPage />
      </RecoilRoot>,
    );

    expect(vscode.postMessage).toHaveBeenCalledWith({
      type: 'onGenerateClicked',
      data: {
        input: '',
        initData: { ...mockIdentifiedSuggestion },
      },
    });
  });
});
