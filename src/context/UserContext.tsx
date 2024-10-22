import { createContext, ReactNode, useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  AnalyzeState,
  ApplicationWebviewState,
  EventDataType,
  FixSuggestionsPayload,
  MessageType,
} from '../types';
import { defaultProvider } from './utils';
import * as State from '../state';

const AccountSettingContext = createContext(defaultProvider);

type Props = {
  children: ReactNode;
};

const AccountSettingProvider = ({ children }: Props): JSX.Element => {
  const setHasWorkSpaceFolders = useSetRecoilState(State.hasWorkSpaceFolders);
  const setHasOpenTextDocuments = useSetRecoilState(State.hasOpenTextDocuments);
  const setIsAnalysisLoading = useSetRecoilState(State.isAnalysisLoading);
  const setApplicationState = useSetRecoilState(State.applicationState);
  const setIdentifiedSuggestion = useSetRecoilState(State.identifiedSuggestion);
  const setIsRecommendationLoading = useSetRecoilState(State.isRecommendationLoading);
  const setRecommendationCount = useSetRecoilState(State.recommendationCount);
  const setRecommendationCurrent = useSetRecoilState(State.recommendationCurrent);
  const setAnalyzeState = useSetRecoilState(State.analyzeState);
  const setAnalysisLoading = useSetRecoilState(State.isAnalysisLoading);
  const setCurrentEditor = useSetRecoilState(State.currentEditor);
  const setCurrentWorkSpaceProject = useSetRecoilState(State.currentWorkSpaceProject);
  const setIsEmptyIdentifiedProblemDetected = useSetRecoilState(
    State.isEmptyIdentifiedProblemDetected,
  );

  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<MessageType>) => {
      const payload = event.data.data;
      switch (event.data.type) {
        case EventDataType.RECOMMENDATION_COUNT:
          setRecommendationCount(payload as number);
          break;
        case EventDataType.RECOMMENDATION_CURRENT:
          setRecommendationCurrent(payload);
          break;
        case EventDataType.ANALYZE_STATE_CHANGED:
          setAnalyzeState(payload as AnalyzeState);
          break;
        case EventDataType.NO_EDITOR_DETECTED:
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          setHasOpenTextDocuments(false);
          setHasWorkSpaceFolders(false);
          break;
        case EventDataType.ANALYSIS_CALLED_ON_SAVE:
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          setAnalysisLoading(true);
          setRecommendationCount(0);
          break;
        case EventDataType.FIX_SUGGESTION:
          setApplicationState(ApplicationWebviewState.SUGGESTION_MODE);
          setIdentifiedSuggestion(payload as FixSuggestionsPayload);
          break;
        case EventDataType.ANALYSIS_ERROR:
          setIsAnalysisLoading(false);
          break;
        case EventDataType.ANALYSIS_COMPLETED_EMPTY_PROBLEMS: {
          const { shouldMoveToAnalyzePage } = payload;
          setIsEmptyIdentifiedProblemDetected(true);
          if (shouldMoveToAnalyzePage) {
            setIdentifiedSuggestion(undefined);
            setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          }
          setIsAnalysisLoading(false);
          break;
        }
        case EventDataType.ANALYSIS_COMPLETED:
          const { shouldMoveToAnalyzePage } = payload;
          setIsEmptyIdentifiedProblemDetected(false);
          if (shouldMoveToAnalyzePage) {
            setIdentifiedSuggestion(undefined);
            setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          }
          setIsAnalysisLoading(false);
          break;
        case EventDataType.INIT_DATA_UPON_NEW_FILE_OPEN:
          const {
            hasOpenTextDocuments: openTextDocuments,
            hasWorkSpaceFolders: openWorkSpaceFolders,
          } = payload;

          if (openTextDocuments) {
            setHasOpenTextDocuments(openTextDocuments || true);
          }

          if (openWorkSpaceFolders) {
            setHasWorkSpaceFolders(openWorkSpaceFolders || true);
          }
          break;
        case EventDataType.INIT_DATA:
          const {
            hasOpenTextDocuments,
            hasWorkSpaceFolders,
            initData,
            currentWorkSpaceFolder,
            currentFile,
          } = payload;

          if (hasOpenTextDocuments) {
            setHasOpenTextDocuments(hasOpenTextDocuments);
          }

          if (hasWorkSpaceFolders) {
            setHasWorkSpaceFolders(hasWorkSpaceFolders);
          }

          if (initData) {
            setAnalyzeState(initData as AnalyzeState);
          }

          if (currentWorkSpaceFolder) {
            setCurrentWorkSpaceProject(currentWorkSpaceFolder);
          }

          if (currentFile) {
            const filename: string | undefined = currentFile?.uri?.fsPath;

            if (!filename) {
              setCurrentEditor(undefined);

              return;
            }
            setCurrentEditor(filename);
          }
          break;
        case EventDataType.GENERATE_CLICKED_GPT_RESPONSE: {
          setIsRecommendationLoading(false);
          break;
        }
        case EventDataType.GENERATE_CLICKED_RESPONSE: {
          setIsRecommendationLoading(false);
          break;
        }

        case EventDataType.GENERATE_CLICKED_ERROR:
          setIsRecommendationLoading(false);
          break;
        case EventDataType.DISCARD_SUGGESTION_SUCCESS: {
          setIdentifiedSuggestion(undefined);
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          break;
        }
        case EventDataType.DISCARD_SUGGESTION_ERROR: {
          break;
        }
        case EventDataType.ENDORSE_SUGGESTION_ERROR:
        case EventDataType.ENDORSE_SUGGESTION_SUCCESS: {
          break;
        }
        case EventDataType.CURRENT_PROJECT:
          const { name } = payload;
          if (name && name !== '') {
            setCurrentWorkSpaceProject(name);
          }
          break;
        case EventDataType.CURRENT_FILE:
          const filename: string | undefined = payload;

          if (!filename) {
            setCurrentEditor(undefined);

            return;
          }
          setCurrentEditor(filename);
          break;
        case EventDataType.VISIBILITY_LOST:
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          break;
        default:
          break;
      }
    },
    [
      setCurrentWorkSpaceProject,
      setCurrentEditor,
      setApplicationState,
      setAnalysisLoading,
      setIsRecommendationLoading,
      setRecommendationCount,
      setRecommendationCurrent,
      setHasWorkSpaceFolders,
      setHasOpenTextDocuments,
      setIsAnalysisLoading,
    ],
  );

  // get initial state
  useEffect(() => {
    vscode.postMessage({ type: EventDataType.GET_INIT_DATA });
  }, []);

  // handle Incoming Messages
  useEffect(() => {
    window.addEventListener('message', (event: MessageEvent<MessageType>) => {
      handleMessagesFromExtension(event);
    });

    return () => {
      window.removeEventListener('message', handleMessagesFromExtension);
    };
  }, [handleMessagesFromExtension]);

  const values = {};

  return <AccountSettingContext.Provider value={values}>{children}</AccountSettingContext.Provider>;
};

export { AccountSettingContext, AccountSettingProvider };
