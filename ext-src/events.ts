import { EventEmitter } from 'vscode';

export interface AnalysisEvents {
  type: 'Analysis_Error' | 'Analysis_Completed' | 'FIX_SUGGESTION';
  data: any;
}

let extensionEventEmitter: EventEmitter<AnalysisEvents> | undefined = undefined;

export const bootstrapExtensionEventEmitter = (): void => {
  if (!extensionEventEmitter) {
    extensionEventEmitter = new EventEmitter<AnalysisEvents>();
  }
};

export const getExtensionEventEmitter = (): EventEmitter<AnalysisEvents> => {
  if (!extensionEventEmitter) {
    extensionEventEmitter = new EventEmitter<AnalysisEvents>();

    return extensionEventEmitter;
  }

  return extensionEventEmitter;
};

export const disposeExtensionEventEmitter = (): void => {
  if (extensionEventEmitter) {
    extensionEventEmitter.dispose();
  }
};
