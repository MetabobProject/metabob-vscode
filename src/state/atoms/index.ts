import { atom } from 'recoil';
import {
  AnalyzeState,
  ApplicationWebviewState,
  FixSuggestionsPayload,
  RecommendationPayload,
} from '../../types';

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
});

export const identifiedSuggestion = atom<FixSuggestionsPayload | undefined>({
  default: undefined,
  key: 'Metabob:identifiedSuggestions',
});

export const isRecommendationLoading = atom<boolean>({
  default: false,
  key: 'Metabob:isRecommendationLoading',
});

export const identifiedRecommendation = atom<RecommendationPayload[] | undefined>({
  default: undefined,
  key: 'Metabob:identifiedRecommendation',
});

export const identifiedProblems = atom<AnalyzeState | undefined>({
  default: undefined,
  key: 'Metabob:IdentifiedProblems',
});
