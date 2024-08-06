import { EventEmitter } from 'vscode';

export interface AnalysisEvents {
  type:
    | 'Analysis_Error'
    | 'Analysis_Completed'
    | 'onDiscardSuggestionClicked:Success'
    | 'Analysis_Called_On_Save'
    | 'No_Editor_Detected'
    | 'FIX_SUGGESTION'
    | 'CURRENT_FILE'
    | 'CURRENT_PROJECT'
    | 'INIT_DATA_UPON_NEW_FILE_OPEN'
    | 'Analysis_Completed_Empty_Problems'
    | 'ANALYZE_STATE_CHANGED';
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
