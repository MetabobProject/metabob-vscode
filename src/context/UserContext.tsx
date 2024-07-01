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
  const setIdentifiedRecommendation = useSetRecoilState(State.identifiedRecommendation);
  const setIdentifiedProblems = useSetRecoilState(State.identifiedProblems);
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
        case EventDataType.NO_EDITOR_DETECTED:
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          setHasOpenTextDocuments(false);
          setHasWorkSpaceFolders(false);
          break;
        case EventDataType.ANALYSIS_CALLED_ON_SAVE:
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          setAnalysisLoading(true);
          setIdentifiedProblems({} as AnalyzeState);
          setIdentifiedRecommendation(undefined);
          break;
        case EventDataType.FIX_SUGGESTION:
          setApplicationState(ApplicationWebviewState.SUGGESTION_MODE);
          setIdentifiedSuggestion(payload as FixSuggestionsPayload);
          break;
        case EventDataType.ANALYSIS_ERROR:
          setIsAnalysisLoading(false);
          break;
        case EventDataType.ANALYSIS_COMPLETED_EMPTY_PROBLEMS: {
          const { shouldResetRecomendation, shouldMoveToAnalyzePage, ...problem } = payload;
          setIsEmptyIdentifiedProblemDetected(true);
          if (problem) {
            setIdentifiedProblems(problem as AnalyzeState);
          }
          if (shouldMoveToAnalyzePage) {
            setIdentifiedSuggestion(undefined);
            setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          }
          if (shouldResetRecomendation) {
            setIdentifiedRecommendation(undefined);
          }
          setIsAnalysisLoading(false);
          break;
        }
        case EventDataType.ANALYSIS_COMPLETED:
          const { shouldResetRecomendation, shouldMoveToAnalyzePage, ...problem } = payload;
          setIsEmptyIdentifiedProblemDetected(false);
          if (problem) {
            setIdentifiedProblems(problem as AnalyzeState);
          }
          if (shouldMoveToAnalyzePage) {
            setIdentifiedSuggestion(undefined);
            setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          }
          if (shouldResetRecomendation) {
            setIdentifiedRecommendation(undefined);
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
            setIdentifiedProblems(initData as AnalyzeState);
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
          const { recommendation: recomendation_from_gpt, problemId } = payload;

          if (recomendation_from_gpt && recomendation_from_gpt.length > 0 && problemId) {
            setIdentifiedRecommendation(prev => {
              const prevRecommendation = prev?.[problemId] || [];
              const newRecomendation = [
                ...prevRecommendation,
                { recommendation: recomendation_from_gpt },
              ];

              return {
                ...prev,
                [problemId]: newRecomendation,
              };
            });
          }
          setIsRecommendationLoading(false);
          break;
        }
        case EventDataType.GENERATE_CLICKED_RESPONSE: {
          const { recommendation, problemId } = payload;
          let adjustedRecommendation: string = recommendation;
          adjustedRecommendation = adjustedRecommendation?.replace("'''", '');
          if (adjustedRecommendation && adjustedRecommendation.length > 0 && problemId) {
            setIdentifiedRecommendation(prev => {
              const prevRecommendation = prev?.[problemId] || [];
              const newRecomendation = [
                ...prevRecommendation,
                { recommendation: adjustedRecommendation },
              ];

              return {
                ...prev,
                [problemId]: newRecomendation,
              };
            });
          }
          setIsRecommendationLoading(false);
          break;
        }

        case EventDataType.GENERATE_CLICKED_ERROR:
          setIsRecommendationLoading(false);
          break;
        case EventDataType.DISCARD_SUGGESTION_SUCCESS: {
          setIdentifiedRecommendation(undefined);
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
          const filename: string | undefined = payload?.uri?.fsPath;

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
      setIdentifiedRecommendation,
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
