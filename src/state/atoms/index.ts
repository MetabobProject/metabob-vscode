import { atom } from 'recoil';
import { ApplicationWebviewState } from '../../types';

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
