import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { ExtensionState, ExtensionStateValue } from './Base';

export type AnalyseMetaData = {
  id: string;
  path: string;
  startLine: number;
  endLine: number;
  category: string;
  summary: string;
  description: string;
  severity: string;
  isDiscarded?: boolean;
  isEndorsed?: boolean;
  isViewed?: boolean;
  fullFilePath?: string;
  expiration?: string;
};

export type AnalyzeState = {
  [filepathAndProblemId: string]: AnalyseMetaData;
};

// Whenever the user Analyze the file, we will store the response of the request in
// a store, so user will be able to see decorations upon changing files.
export class Analyze extends ExtensionState<AnalyzeState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.analyze);
  }

  get(): ExtensionStateValue<AnalyzeState> {
    return this.context.globalState.get<ExtensionStateValue<AnalyzeState>>(this.key, {
      key: this.key,
      value: {},
    });
  }

  set(value: AnalyzeState): Thenable<void> {
    const stateValue = { key: this.key, value };

    return this.context.globalState.update(this.key, stateValue);
  }

  update(callback: (value: AnalyzeState) => AnalyzeState): Thenable<void | undefined> {
    const currentValue = this.get()?.value ?? {};
    const updatedValue = callback(currentValue);

    return this.set(updatedValue);
  }

  clear(): void {
    this.context.globalState.update(this.key, undefined);
  }
}
