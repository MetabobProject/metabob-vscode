import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist'
import {
  AnalyzeState,
  ApplicationWebviewState,
  FixSuggestionsPayload,
  RecommendationPayload,
} from '../../types';

const { persistAtom } = recoilPersist()


export const hasOpenTextDocuments = atom<boolean>({
  default: false,
  key: 'Metabob:hasOpenTextDocuments',
});

export const hasWorkSpaceFolders = atom<boolean>({
  default: false,
  key: 'Metabob:hasWorkSpaceFolders',
});

export const isAnalysisLoading = atom<boolean>({
  default: false,
  key: 'Metabob:isAnalysisCompleted',
});

export const applicationState = atom<ApplicationWebviewState>({
  default: ApplicationWebviewState.ANALYZE_MODE,
  key: 'Metabob:applicationState',
  effects_UNSTABLE: [persistAtom]
});

export const identifiedSuggestion = atom<FixSuggestionsPayload | undefined>({
  default: undefined,
  key: 'Metabob:identifiedSuggestions',
  effects_UNSTABLE: [persistAtom]
});

export const isRecommendationLoading = atom<boolean>({
  default: false,
  key: 'Metabob:isRecommendationLoading',
});

export const identifiedRecommendation = atom<RecommendationPayload[] | undefined>({
  default: undefined,
  key: 'Metabob:identifiedRecommendation',
  effects_UNSTABLE: [persistAtom]
});

export const identifiedProblems = atom<AnalyzeState | undefined>({
  default: undefined,
  key: 'Metabob:IdentifiedProblems',
  effects_UNSTABLE: [persistAtom]
});

export const currentEditor = atom<string | undefined>({
  default: undefined,
  key: 'Metabob:currentEditor',
})

export const currentWorkSpaceProject = atom<string | undefined>({
  default: undefined,
  key: 'Metabob:currentWorkSpaceProject',
})