import { useEffect } from 'react';
import { act, render } from '@testing-library/react';

// Manually mock vscode
jest.mock('vscode');
import vscode from '../__mocks__/vscode';
(global as any).vscode = vscode;

import { RecoilRoot, useRecoilValue } from 'recoil';
import { AccountSettingProvider } from './UserContext';
import {
  ApplicationWebviewState,
  EventDataType,
  FixSuggestionsPayload,
  MessageType,
} from '../types';
import * as State from '../state';
import { IdentifiedProblems } from '../__mocks__/identifiedProblems';

// @ts-ignore
export const RecoilObserver = ({ node, onChange }) => {
  const value = useRecoilValue(node);
  useEffect(() => onChange(value), [onChange, value]);
  return null;
};

describe('AccountSettingProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should recieve Get_INIT_DATA event when the component renders', () => {
    const mockApplicationStateHandler = jest.fn();
    const mockHasWorkSpaceFoldersStateHandler = jest.fn();
    const mockHasOpenTextDocumentsStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.hasWorkSpaceFolders}
            onChange={mockHasWorkSpaceFoldersStateHandler}
          />
          <RecoilObserver
            node={State.hasOpenTextDocuments}
            onChange={mockHasOpenTextDocumentsStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    expect(vscode.postMessage).toHaveBeenCalledWith({ type: EventDataType.GET_INIT_DATA });
  });

  it('should update Recoil state correctly on NO_EDITOR_DETECTED event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockApplicationStateHandler = jest.fn();
    const mockHasWorkSpaceFoldersStateHandler = jest.fn();
    const mockHasOpenTextDocumentsStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.hasWorkSpaceFolders}
            onChange={mockHasWorkSpaceFoldersStateHandler}
          />
          <RecoilObserver
            node={State.hasOpenTextDocuments}
            onChange={mockHasOpenTextDocumentsStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = undefined;
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.NO_EDITOR_DETECTED,
          data: payload,
        },
      });

      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockHasWorkSpaceFoldersStateHandler).toHaveBeenCalledWith(false);
    expect(mockHasOpenTextDocumentsStateHandler).toHaveBeenCalledWith(false);
  });

  it('should update Recoil state correctly on ANALYSIS_CALLED_ON_SAVE event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockApplicationStateHandler = jest.fn();
    const mockAnalysisLoadingStateHandler = jest.fn();
    const mockIdentifiedProblemsStateHandler = jest.fn();
    const mockIdentifiedRecommendationStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.isAnalysisLoading}
            onChange={mockAnalysisLoadingStateHandler}
          />
          <RecoilObserver
            node={State.identifiedProblems}
            onChange={mockIdentifiedProblemsStateHandler}
          />
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = undefined;
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.ANALYSIS_CALLED_ON_SAVE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockAnalysisLoadingStateHandler).toHaveBeenCalledWith(true);
    expect(mockIdentifiedProblemsStateHandler).toHaveBeenCalledWith({});
    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on FIX_SUGGESTION event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockApplicationStateHandler = jest.fn();
    const mockIdentifiedSuggestionStateHandler = jest.fn();
    const mockPayload: FixSuggestionsPayload = {
      path: '/file/to/suggestion',
      id: '1',
      vuln: {
        id: '1',
        path: '/file/to/suggestion',
        startLine: 1,
        endLine: 2,
        category: 'LOGIC',
        summary: 'LOGIC',
        description: 'LOGIC',
      },
      isFix: false,
      isReset: false,
    };

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.identifiedSuggestion}
            onChange={mockIdentifiedSuggestionStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.FIX_SUGGESTION,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(
      ApplicationWebviewState.SUGGESTION_MODE,
    );
    expect(mockIdentifiedSuggestionStateHandler).toHaveBeenCalledWith(mockPayload);
  });

  it('should update Recoil state correctly on ANALYSIS_ERROR event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockIsAnalysisLoadingStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.isAnalysisLoading}
            onChange={mockIsAnalysisLoadingStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = undefined;
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.ANALYSIS_ERROR,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockIsAnalysisLoadingStateHandler).toHaveBeenCalledWith(false);
  });

  it('should update Recoil state correctly on INIT_DATA_UPON_NEW_FILE_OPEN event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockHasOpenTextDocumentsStateHandler = jest.fn();
    const mockHasWorkSpaceFoldersStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.hasOpenTextDocuments}
            onChange={mockHasOpenTextDocumentsStateHandler}
          />
          <RecoilObserver
            node={State.hasWorkSpaceFolders}
            onChange={mockHasWorkSpaceFoldersStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {
        hasOpenTextDocuments: true,
        hasWorkSpaceFolders: true,
      };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.INIT_DATA_UPON_NEW_FILE_OPEN,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockHasOpenTextDocumentsStateHandler).toHaveBeenCalledWith(true);
    expect(mockHasWorkSpaceFoldersStateHandler).toHaveBeenCalledWith(true);
  });

  it('should update Recoil state correctly on INIT_DATA_UPON_NEW_FILE_OPEN event with different edge case', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockHasOpenTextDocumentsStateHandler = jest.fn();
    const mockHasWorkSpaceFoldersStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.hasOpenTextDocuments}
            onChange={mockHasOpenTextDocumentsStateHandler}
          />
          <RecoilObserver
            node={State.hasWorkSpaceFolders}
            onChange={mockHasWorkSpaceFoldersStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {
        hasOpenTextDocuments: false,
        hasWorkSpaceFolders: false,
      };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.INIT_DATA_UPON_NEW_FILE_OPEN,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockHasOpenTextDocumentsStateHandler).toHaveBeenCalledWith(false);
    expect(mockHasWorkSpaceFoldersStateHandler).toHaveBeenCalledWith(false);
  });

  it('should update Recoil state correctly on ANALYSIS_COMPLETED event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    const mockApplicationStateHandler = jest.fn();
    const mockIdentifiedProblemsStateHandler = jest.fn();
    const mockIdentifiedSuggestionStateHandler = jest.fn();
    const mockIdentifiedRecommendationStateHandler = jest.fn();
    const mockIsAnalysisLoadingStateHandler = jest.fn();

    const mockPayload = {
      shouldResetRecomendation: false,
      shouldMoveToAnalyzePage: true,
      ...IdentifiedProblems,
    };

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.identifiedProblems}
            onChange={mockIdentifiedProblemsStateHandler}
          />
          <RecoilObserver
            node={State.identifiedSuggestion}
            onChange={mockIdentifiedSuggestionStateHandler}
          />
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
          <RecoilObserver
            node={State.isAnalysisLoading}
            onChange={mockIsAnalysisLoadingStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.ANALYSIS_COMPLETED,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockIdentifiedProblemsStateHandler).toHaveBeenCalledWith(IdentifiedProblems);
    expect(mockIdentifiedSuggestionStateHandler).toHaveBeenCalledWith(undefined);
    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith(undefined);
    expect(mockIsAnalysisLoadingStateHandler).toHaveBeenCalledWith(false);
  });

  it('should update Recoil state correctly on ANALYSIS_COMPLETED even with an edge case', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    const mockApplicationStateHandler = jest.fn();
    const mockIdentifiedProblemsStateHandler = jest.fn();
    const mockIdentifiedSuggestionStateHandler = jest.fn();
    const mockIdentifiedRecommendationStateHandler = jest.fn();
    const mockIsAnalysisLoadingStateHandler = jest.fn();

    const mockPayload = {
      shouldResetRecomendation: true,
      shouldMoveToAnalyzePage: true,
      ...IdentifiedProblems,
    };

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.identifiedProblems}
            onChange={mockIdentifiedProblemsStateHandler}
          />
          <RecoilObserver
            node={State.identifiedSuggestion}
            onChange={mockIdentifiedSuggestionStateHandler}
          />
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
          <RecoilObserver
            node={State.isAnalysisLoading}
            onChange={mockIsAnalysisLoadingStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.ANALYSIS_COMPLETED,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockIdentifiedProblemsStateHandler).toHaveBeenCalledWith(IdentifiedProblems);
    expect(mockIdentifiedSuggestionStateHandler).toHaveBeenCalledWith(undefined);
    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith(undefined);
    expect(mockIsAnalysisLoadingStateHandler).toHaveBeenCalledWith(false);
  });

  it('should update Recoil state correctly on GENERATE_CLICKED_ERROR event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockIsRecommendationLoadingHandler = jest.fn();
    const mockPayload = undefined;

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.isRecommendationLoading}
            onChange={mockIsRecommendationLoadingHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.GENERATE_CLICKED_ERROR,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockIsRecommendationLoadingHandler).toHaveBeenCalledWith(false);
  });

  it('should update Recoil state correctly on DISCARD_SUGGESTION_SUCCESS event', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockIdentifiedSuggestionStateHandler = jest.fn();
    const mockIdentifiedRecommendationStateHandler = jest.fn();
    const mockApplicationStateHandler = jest.fn();
    const mockPayload = undefined;

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.identifiedSuggestion}
            onChange={mockIdentifiedSuggestionStateHandler}
          />
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.DISCARD_SUGGESTION_SUCCESS,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockIdentifiedSuggestionStateHandler).toHaveBeenCalledWith(undefined);
    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should not update Recoil State on case DISCARD_SUGGESTION_ERROR, ENDORSE_SUGGESTION_ERROR, ENDORSE_SUGGESTION_SUCCESS', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockIdentifiedSuggestionStateHandler = jest.fn();
    const mockIdentifiedRecommendationStateHandler = jest.fn();
    const mockApplicationStateHandler = jest.fn();
    const mockPayload = undefined;

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.identifiedSuggestion}
            onChange={mockIdentifiedSuggestionStateHandler}
          />
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.DISCARD_SUGGESTION_ERROR,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent);
      const messageEvent2 = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.ENDORSE_SUGGESTION_ERROR,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent2);
      const messageEvent3 = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.ENDORSE_SUGGESTION_SUCCESS,
          data: mockPayload,
        },
      });
      mockMessageEvent(messageEvent3);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockIdentifiedSuggestionStateHandler).toHaveBeenCalledWith(undefined);
    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on CURRENT_FILE event with valid filename', () => {
    const mockCurrentEditorStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    const payload = { fileName: '/path/to/exampleFile.git' };

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.currentEditor} onChange={mockCurrentEditorStateHandler} />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_FILE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    const expectedFilename = payload.fileName.split('/').pop()?.replace('.git', '') ?? undefined;

    expect(mockCurrentEditorStateHandler).toHaveBeenCalledWith(expectedFilename);
  });

  it('should update Recoil state correctly on CURRENT_FILE event with invalid filename', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    const mockCurrentEditorStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.currentEditor} onChange={mockCurrentEditorStateHandler} />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = { fileName: '/path/to/invalidFile' };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_FILE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockCurrentEditorStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on CURRENT_FILE event with empty filename', () => {
    const mockCurrentEditorStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.currentEditor} onChange={mockCurrentEditorStateHandler} />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = { fileName: '' };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_FILE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockCurrentEditorStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on CURRENT_FILE event with undefined filename', () => {
    const mockCurrentEditorStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.currentEditor} onChange={mockCurrentEditorStateHandler} />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {};
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_FILE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockCurrentEditorStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on CURRENT_PROJECT event with valid project name', () => {
    const mockCurrentWorkSpaceProjectStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.currentWorkSpaceProject}
            onChange={mockCurrentWorkSpaceProjectStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = { name: 'exampleProject' }; // Valid project name
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_PROJECT,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockCurrentWorkSpaceProjectStateHandler).toHaveBeenCalledWith('exampleProject');
  });

  it('should update Recoil state correctly on CURRENT_PROJECT event with empty project name', () => {
    const mockCurrentWorkSpaceProjectStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.currentWorkSpaceProject}
            onChange={mockCurrentWorkSpaceProjectStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = { name: '' }; // Empty project name
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_PROJECT,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockCurrentWorkSpaceProjectStateHandler).not.toHaveBeenCalledWith('');
  });

  it('should update Recoil state correctly on CURRENT_PROJECT event with undefined project name', () => {
    const mockCurrentWorkSpaceProjectStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.currentWorkSpaceProject}
            onChange={mockCurrentWorkSpaceProjectStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {};
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.CURRENT_PROJECT,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockCurrentWorkSpaceProjectStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on INIT_DATA event with valid payload', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    const mockApplicationStateHandler = jest.fn();
    const mockHasOpenTextDocumentsStateHandler = jest.fn();
    const mockHasWorkSpaceFoldersStateHandler = jest.fn();
    const mockIdentifiedProblemsStateHandler = jest.fn();
    const mockCurrentWorkSpaceProjectStateHandler = jest.fn();
    const mockCurrentEditorStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.hasOpenTextDocuments}
            onChange={mockHasOpenTextDocumentsStateHandler}
          />
          <RecoilObserver
            node={State.hasWorkSpaceFolders}
            onChange={mockHasWorkSpaceFoldersStateHandler}
          />
          <RecoilObserver
            node={State.identifiedProblems}
            onChange={mockIdentifiedProblemsStateHandler}
          />
          <RecoilObserver
            node={State.currentWorkSpaceProject}
            onChange={mockCurrentWorkSpaceProjectStateHandler}
          />
          <RecoilObserver node={State.currentEditor} onChange={mockCurrentEditorStateHandler} />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {
        hasOpenTextDocuments: true,
        hasWorkSpaceFolders: true,
        initData: {
          ...IdentifiedProblems,
        },
        currentWorkSpaceFolder: 'exampleProject',
        currentFile: { fileName: 'exampleFileName.git' },
      };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.INIT_DATA,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockHasOpenTextDocumentsStateHandler).toHaveBeenCalledWith(true);
    expect(mockHasWorkSpaceFoldersStateHandler).toHaveBeenCalledWith(true);
    expect(mockIdentifiedProblemsStateHandler).toHaveBeenCalledWith(IdentifiedProblems);
    expect(mockCurrentWorkSpaceProjectStateHandler).toHaveBeenCalledWith('exampleProject');
    expect(mockCurrentEditorStateHandler).toHaveBeenCalledWith('exampleFileName');
  });

  it('should update Recoil state correctly on INIT_DATA event with valid payload with an edge case', () => {
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    const mockApplicationStateHandler = jest.fn();
    const mockHasOpenTextDocumentsStateHandler = jest.fn();
    const mockHasWorkSpaceFoldersStateHandler = jest.fn();
    const mockIdentifiedProblemsStateHandler = jest.fn();
    const mockCurrentWorkSpaceProjectStateHandler = jest.fn();
    const mockCurrentEditorStateHandler = jest.fn();

    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver node={State.applicationState} onChange={mockApplicationStateHandler} />
          <RecoilObserver
            node={State.hasOpenTextDocuments}
            onChange={mockHasOpenTextDocumentsStateHandler}
          />
          <RecoilObserver
            node={State.hasWorkSpaceFolders}
            onChange={mockHasWorkSpaceFoldersStateHandler}
          />
          <RecoilObserver
            node={State.identifiedProblems}
            onChange={mockIdentifiedProblemsStateHandler}
          />
          <RecoilObserver
            node={State.currentWorkSpaceProject}
            onChange={mockCurrentWorkSpaceProjectStateHandler}
          />
          <RecoilObserver node={State.currentEditor} onChange={mockCurrentEditorStateHandler} />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {
        hasOpenTextDocuments: true,
        hasWorkSpaceFolders: true,
        initData: {
          ...IdentifiedProblems,
        },
        currentWorkSpaceFolder: 'exampleProject',
        currentFile: {},
      };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.INIT_DATA,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockApplicationStateHandler).toHaveBeenCalledWith(ApplicationWebviewState.ANALYZE_MODE);
    expect(mockHasOpenTextDocumentsStateHandler).toHaveBeenCalledWith(true);
    expect(mockHasWorkSpaceFoldersStateHandler).toHaveBeenCalledWith(true);
    expect(mockIdentifiedProblemsStateHandler).toHaveBeenCalledWith(IdentifiedProblems);
    expect(mockCurrentWorkSpaceProjectStateHandler).toHaveBeenCalledWith('exampleProject');
    expect(mockCurrentEditorStateHandler).toHaveBeenCalledWith(undefined);
  });

  it('should update Recoil state correctly on GENERATE_CLICKED_RESPONSE event with valid payload', () => {
    const mockIdentifiedRecommendationStateHandler = jest.fn();
    const mockIsRecommendationLoadingStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    render(
      <RecoilRoot>
        <AccountSettingProvider>
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
          <RecoilObserver
            node={State.isRecommendationLoading}
            onChange={mockIsRecommendationLoadingStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {
        recommendation: 'Some recommendation',
        problemId: 'problem1',
      };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.GENERATE_CLICKED_RESPONSE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith({
      problem1: [{ recommendation: 'Some recommendation' }],
    });
    expect(mockIsRecommendationLoadingStateHandler).toHaveBeenCalledWith(false);
  });

  it('should not update Recoil state on GENERATE_CLICKED_RESPONSE event with empty recommendation', () => {
    const mockIdentifiedRecommendationStateHandler = jest.fn();
    const mockIsRecommendationLoadingStateHandler = jest.fn();
    const mockMessageEvent = (event: MessageEvent<MessageType>) => {
      window.dispatchEvent(event);
    };
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(State.identifiedRecommendation, undefined);
        }}
      >
        <AccountSettingProvider>
          <RecoilObserver
            node={State.identifiedRecommendation}
            onChange={mockIdentifiedRecommendationStateHandler}
          />
          <RecoilObserver
            node={State.isRecommendationLoading}
            onChange={mockIsRecommendationLoadingStateHandler}
          />
        </AccountSettingProvider>
      </RecoilRoot>,
    );

    act(() => {
      const payload = {
        recommendation: '', // Empty recommendation
        problemId: 'problem2',
      };
      const messageEvent = new MessageEvent<MessageType>('message', {
        data: {
          type: EventDataType.GENERATE_CLICKED_RESPONSE,
          data: payload,
        },
      });
      mockMessageEvent(messageEvent);
    });

    // Ensure Recoil state remains unchanged
    expect(mockIdentifiedRecommendationStateHandler).toHaveBeenCalledWith({
      problem1: [{ recommendation: 'Some recommendation' }],
    });
    expect(mockIsRecommendationLoadingStateHandler).toHaveBeenCalledWith(false);
  });
});
