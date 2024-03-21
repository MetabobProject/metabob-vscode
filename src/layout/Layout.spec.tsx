import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

// Manually mock vscode
jest.mock('vscode');
import vscode from '../__mocks__/vscode';
import { Layout } from './Layout';
import * as State from '../state';
import { ApplicationWebviewState } from '../types';
import { useEffect } from 'react';

(global as any).vscode = vscode;

export const RecoilObserver = ({ node, onChange }: any) => {
  const value = useRecoilValue(node);
  useEffect(() => onChange(value), [onChange, value]);
  return null;
};

describe('Layout component', () => {
  test('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.applicationState, ApplicationWebviewState.ANALYZE_MODE);
        }}
      >
        <Layout>
          <div>Child component</div>
        </Layout>
      </RecoilRoot>,
    );

    expect(getByText('Child component')).toBeInTheDocument();
    expect(getByTestId('docs-button')).toBeInTheDocument();
  });

  test('docs button click opens external link', () => {
    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.applicationState, ApplicationWebviewState.ANALYZE_MODE);
        }}
      >
        <Layout>
          <div>Child component</div>
        </Layout>
      </RecoilRoot>,
    );

    fireEvent.click(getByTestId('docs-button'));

    expect(vscode.postMessage).toHaveBeenCalledWith({
      type: 'open_external_link',
      data: {
        url: 'https://marketplace.visualstudio.com/items?itemName=Metabob.metabob',
      },
    });
  });

  test('back button click switches to analyze mode', () => {
    const onChange = jest.fn();

    const { getByTestId, queryByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) =>
          set(State.applicationState, ApplicationWebviewState.SUGGESTION_MODE)
        }
      >
        <RecoilObserver node={State.applicationState} onChange={onChange} />
        <Layout>
          <div>Child component</div>
        </Layout>
      </RecoilRoot>,
    );

    expect(queryByTestId('analyze-mode-back-button')).toBeDefined();
    fireEvent.click(getByTestId('analyze-mode-back-button'));
    expect(onChange).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
  });
});
