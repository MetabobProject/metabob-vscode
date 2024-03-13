import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AnalyzePage } from './index';

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
      <RecoilRoot>
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
