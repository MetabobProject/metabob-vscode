import { EventEmitter } from 'vscode';

export interface AnalysisEvents {
  type: 'Analysis_Error' | 'Analysis_Completed';
  data: any;
}

let analysisEventEmitter: EventEmitter<AnalysisEvents> | undefined = undefined;

export const bootstrapAnalysisEventEmitter = (): void => {
  if (!analysisEventEmitter) {
    analysisEventEmitter = new EventEmitter<AnalysisEvents>();
  }
};

export const getAnalysisEventEmitter = (): EventEmitter<AnalysisEvents> => {
  if (!analysisEventEmitter) {
    analysisEventEmitter = new EventEmitter<AnalysisEvents>();

    return analysisEventEmitter;
  }

  return analysisEventEmitter;
};

export const disposeAnalysisEventEmitter = (): void => {
  if (analysisEventEmitter) {
    analysisEventEmitter.dispose();
  }
};
