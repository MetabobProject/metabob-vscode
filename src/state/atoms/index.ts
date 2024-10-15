import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { AnalyzeState, ApplicationWebviewState, FixSuggestionsPayload } from '../../types';

const { persistAtom } = recoilPersist();

export const defaults = {
  hasOpenTextDocuments: false,
  hasWorkSpaceFolders: false,
  isAnalysisLoading: false,
  applicationState: ApplicationWebviewState.ANALYZE_MODE,
  identifiedSuggestion: undefined,
  isRecommendationLoading: false,
  recommendationCount: 0,
  recommendationCurrent: undefined,
  analyzeState: undefined,
  isEmptyIdentifiedProblemDetected: false,
  currentEditor: undefined,
  currentWorkSpaceProject: undefined,
};

export const hasOpenTextDocuments = atom<boolean>({
  default: defaults.hasOpenTextDocuments,
  key: 'Metabob:hasOpenTextDocuments',
});

export const hasWorkSpaceFolders = atom<boolean>({
  default: defaults.hasWorkSpaceFolders,
  key: 'Metabob:hasWorkSpaceFolders',
});

export const isAnalysisLoading = atom<boolean>({
  default: defaults.isAnalysisLoading,
  key: 'Metabob:isAnalysisCompleted',
});

export const applicationState = atom<ApplicationWebviewState>({
  default: defaults.applicationState,
  key: 'Metabob:applicationState',
  effects_UNSTABLE: [persistAtom],
});

export const identifiedSuggestion = atom<FixSuggestionsPayload | undefined>({
  default: defaults.identifiedSuggestion,
  key: 'Metabob:identifiedSuggestions',
  effects_UNSTABLE: [persistAtom],
});

export const isRecommendationLoading = atom<boolean>({
  default: defaults.isRecommendationLoading,
  key: 'Metabob:isRecommendationLoading',
});

export const recommendationCount = atom<number>({
  default: defaults.recommendationCount,
  key: 'Metabob:recommendationCount',
});

export const recommendationCurrent = atom<number | undefined>({
  default: defaults.recommendationCurrent,
  key: 'Metabob:recommendationCurrent',
});

export const analyzeState = atom<AnalyzeState | undefined>({
  default: defaults.analyzeState,
  key: 'Metabob:analyzeState',
  effects_UNSTABLE: [persistAtom],
});

export const isEmptyIdentifiedProblemDetected = atom<boolean>({
  default: defaults.isEmptyIdentifiedProblemDetected,
  key: 'Metabob:isEmptyIdentifiedProblemDetected',
});

export const currentEditor = atom<string | undefined>({
  default: defaults.currentEditor,
  key: 'Metabob:currentEditor',
});

export const currentWorkSpaceProject = atom<string | undefined>({
  default: defaults.currentWorkSpaceProject,
  key: 'Metabob:currentWorkSpaceProject',
});
