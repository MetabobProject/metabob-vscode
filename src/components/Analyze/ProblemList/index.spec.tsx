import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

// Manually mock vscode
jest.mock('vscode');

import vscode from '../../../__mocks__/vscode';
import { ProblemList } from './index';

// Mocking useTheme
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: jest.fn(() => ({
    // Define any properties used by the component here
    spacing: jest.fn(),
  })),
}));

(global as any).vscode = vscode;

describe('ProblemList component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with detectedProblems', () => {
    const { getByText } = render(
      <RecoilRoot>
        <ProblemList detectedProblems={3} otherFileWithProblems={[]} />
      </RecoilRoot>,
    );
    expect(getByText('3 Problems Detected')).toBeInTheDocument();
  });

  test('renders correctly with otherFileWithProblems', () => {
    const otherFileWithProblems = [{ name: 'file1.txt' }, { name: 'file2.txt' }];
    const { getByText, getAllByText } = render(
      <RecoilRoot>
        <ProblemList detectedProblems={0} otherFileWithProblems={otherFileWithProblems} />
      </RecoilRoot>,
    );
    expect(getByText('Other files with problems')).toBeInTheDocument();
    otherFileWithProblems.forEach(({ name }) => {
      expect(getAllByText(name)).toHaveLength(1); // Ensure each file name is rendered once
    });
  });

  test('handles opening other files correctly', () => {
    const otherFileWithProblems = [{ name: 'file1.txt' }];
    const { getByText } = render(
      <RecoilRoot>
        <ProblemList detectedProblems={0} otherFileWithProblems={otherFileWithProblems} />
      </RecoilRoot>,
    );
    fireEvent.click(getByText('Open'));
    expect(vscode.postMessage).toHaveBeenCalledWith({
      type: 'OPEN_FILE_IN_NEW_TAB',
      data: { name: 'file1.txt' },
    });
  });
});
