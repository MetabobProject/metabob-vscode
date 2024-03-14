import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

// Manually mock vscode
jest.mock('vscode');
import vscode from '../__mocks__/vscode';
import { Layout } from './Layout';
import * as State from '../state';
import { ApplicationWebviewState } from '../types';

(global as any).vscode = vscode;

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
});
