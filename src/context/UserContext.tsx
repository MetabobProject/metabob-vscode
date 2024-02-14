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
          break;
        case EventDataType.FIX_SUGGESTION:
          setApplicationState(ApplicationWebviewState.SUGGESTION_MODE);
          setIdentifiedSuggestion(payload as FixSuggestionsPayload);
          break;
        case EventDataType.ANALYSIS_ERROR:
          setIsAnalysisLoading(false);
          break;
        case EventDataType.ANALYSIS_COMPLETED:
          setIdentifiedProblems(payload as AnalyzeState);
          setIsAnalysisLoading(false);
          break;
        case EventDataType.INIT_DATA:
          const { hasOpenTextDocuments, hasWorkSpaceFolders } = payload;

          if (hasOpenTextDocuments) {
            setHasOpenTextDocuments(hasOpenTextDocuments);
          }

          if (hasWorkSpaceFolders) {
            setHasWorkSpaceFolders(hasWorkSpaceFolders);
          }
          break;
        case EventDataType.GENERATE_CLICKED_GPT_RESPONSE:
          setIdentifiedRecommendation(prev => {
            return [...(prev || []), { recommendation: payload.choices[0].message.content }];
          });
          setIsRecommendationLoading(false);

          break;
        case EventDataType.GENERATE_CLICKED_RESPONSE:
          const { recommendation } = payload;
          const adjustedRecommendation: string = recommendation;
          adjustedRecommendation.replace("'''", '');
          if (adjustedRecommendation !== '') {

            setIdentifiedRecommendation(prev => {
              return [...(prev || []), { recommendation: adjustedRecommendation }];
            });
          }
          setIsRecommendationLoading(false);
          break;
        case EventDataType.GENERATE_CLICKED_ERROR:
          setIsRecommendationLoading(false);
          break;
        case EventDataType.DISCARD_SUGGESTION_SUCCESS: {
          setApplicationState(ApplicationWebviewState.ANALYZE_MODE);
          setIdentifiedSuggestion(payload as FixSuggestionsPayload)
          break;
        }
        case EventDataType.DISCARD_SUGGESTION_ERROR: {
          break;
        }
        case EventDataType.ENDORSE_SUGGESTION_ERROR:
        case EventDataType.ENDORSE_SUGGESTION_SUCCESS: {
          break;
        }
        default:
          break;
      }
    },
    [

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
