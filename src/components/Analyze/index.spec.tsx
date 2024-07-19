import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AnalyzePage } from './index';
import * as State from '../../state';
import { IdentifiedProblems } from '../../__mocks__/identifiedProblems';

describe('AnalyzePage component', () => {
  test('renders analyze button correctly when hasWorkSpaceFolders and hasOpenTextDocuments are true', () => {
    const { getByText } = render(
      <RecoilRoot>
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={jest.fn()}
        />
      </RecoilRoot>,
    );
    const analyzeButton = getByText('Analyze');
    expect(analyzeButton).toBeDefined();
    expect(analyzeButton).toBeTruthy();
  });

  test('renders disabled button correctly when hasWorkSpaceFolders or hasOpenTextDocuments is false', () => {
    const { getByText } = render(
      <RecoilRoot>
        <AnalyzePage
          hasWorkSpaceFolders={false}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={jest.fn()}
        />
      </RecoilRoot>,
    );
    const disabledButton = getByText('Please open a project to analyze');
    expect(disabledButton).toBeDefined();
  });

  test('triggers handleAnalyzeClick when Analyze button is clicked', () => {
    const handleAnalyzeClick = jest.fn();
    const { getByText } = render(
      <RecoilRoot>
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={handleAnalyzeClick}
        />
      </RecoilRoot>,
    );
    const analyzeButton = getByText('Analyze');
    fireEvent.click(analyzeButton);
    expect(handleAnalyzeClick).toHaveBeenCalledTimes(1);
  });

  test('renders analyze button correctly when hasWorkSpaceFolders and hasOpenTextDocuments are true', () => {
    const { getByText } = render(
      <RecoilRoot>
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={jest.fn()}
        />
      </RecoilRoot>,
    );
    const analyzeButton = getByText('Analyze');
    expect(analyzeButton).toBeDefined();
    expect(analyzeButton).toBeTruthy();
  });

  test('renders ProblemList component correctly when hasWorkSpaceFolders and hasOpenTextDocuments are true', () => {
    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.hasOpenTextDocuments, true);
          set(State.hasOpenTextDocuments, true);
          set(State.currentEditor, 'example.py');
          set(State.analyzeState, IdentifiedProblems);
          set(State.currentWorkSpaceProject, 'example');
        }}
      >
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={jest.fn()}
        />
      </RecoilRoot>,
    );
    const problemList = getByTestId('problem-list');
    expect(problemList).toBeDefined();
  });

  test('renders ProblemList component correctly and handle edge cases', () => {
    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.hasOpenTextDocuments, true);
          set(State.hasOpenTextDocuments, true);
          set(State.currentEditor, undefined);
          set(State.analyzeState, IdentifiedProblems);
          set(State.currentWorkSpaceProject, 'example');
        }}
      >
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={jest.fn()}
        />
      </RecoilRoot>,
    );
    const problemList = getByTestId('problem-list');
    expect(problemList).toBeDefined();
  });

  test('Render Circular Progress bar when isAnalysisLoading is true', () => {
    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.isAnalysisLoading, true);
        }}
      >
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={true}
          handleAnalyzeClick={jest.fn()}
        />
      </RecoilRoot>,
    );
    const progressBar = getByTestId('progress-bar');
    expect(progressBar).toBeDefined();
  });

  test('triggers handleAnalyzeClick when Analyze button is clicked', () => {
    const handleAnalyzeClick = jest.fn();
    const { getByText } = render(
      <RecoilRoot>
        <AnalyzePage
          hasWorkSpaceFolders={true}
          hasOpenTextDocuments={true}
          isAnalysisLoading={false}
          handleAnalyzeClick={handleAnalyzeClick}
        />
      </RecoilRoot>,
    );
    const analyzeButton = getByText('Analyze');
    fireEvent.click(analyzeButton);
    expect(handleAnalyzeClick).toHaveBeenCalledTimes(1);
  });
});
