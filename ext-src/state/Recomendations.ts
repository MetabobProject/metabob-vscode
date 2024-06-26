import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { ExtensionState, ExtensionStateValue } from './Base';

export type RecommendationState = {
  content?: string;
  path?: string;
  problemId?: string;
  startLine?: number;
  endLine?: number;
  category?: string;
  summary?: string;
  recommendations?: string;
};

export type RecommendationsState = Array<RecommendationState>;

// This is used when user performs recommendation from the Metabob, this state store the current value.
export class Recommendations extends ExtensionState<RecommendationsState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.recommendations);
  }

  get(): ExtensionStateValue<RecommendationsState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<RecommendationsState>>(this.key);
  }

  set(value: RecommendationsState): Thenable<void> {
    const stateValue = { key: this.key, value };

    return this.context.globalState.update(this.key, stateValue);
  }

  update(
    callback: (value: RecommendationsState) => RecommendationsState,
  ): Thenable<void | undefined> {
    const value = this.get();
    const updatedValue = callback(value?.value || [{}]);

    return this.set(updatedValue);
  }
}
