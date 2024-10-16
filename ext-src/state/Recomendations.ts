import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { ExtensionState, ExtensionStateValue } from './Base';
import { getExtensionEventEmitter } from '../events';

export type RecommendationsState =
  | {
      problemId: string;
      current: number;
      recommendations: Array<string>;
    }
  | undefined;

const extensionEventEmitter = getExtensionEventEmitter();

// This is used when user performs recommendations for the current problem.
// The recommendations are stored to allow the user to go through them with
// the forward and backward buttons in the webview.
export class Recommendations extends ExtensionState<RecommendationsState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.recommendations);
  }

  get(): ExtensionStateValue<RecommendationsState> {
    return this.context.workspaceState.get<ExtensionStateValue<RecommendationsState>>(this.key, {
      key: this.key,
      value: undefined,
    });
  }

  set(value: RecommendationsState): Thenable<void> {
    const stateValue = { key: this.key, value };

    return this.context.workspaceState.update(this.key, stateValue);
  }

  update(callback: (value: RecommendationsState) => RecommendationsState): Thenable<void> {
    const value = this.value();
    const updatedValue = callback(value);

    return this.set(updatedValue);
  }

  clear(): Thenable<void> {
    extensionEventEmitter.fire({ type: 'recommendationCount', data: 0 });
    extensionEventEmitter.fire({ type: 'recommendationCurrent', data: undefined });

    return this.context.workspaceState.update(this.key, undefined);
  }

  value(): RecommendationsState {
    return this.get().value;
  }

  appendRecommendation(problemId: string, recommendation: string): Thenable<void> {
    return this.update(state => {
      let newState: RecommendationsState;
      if (state === undefined || state.problemId !== problemId) {
        newState = { problemId, current: 0, recommendations: [recommendation] };
      } else {
        newState = {
          problemId: state.problemId,
          current: state.recommendations.length,
          recommendations: [...state.recommendations, recommendation],
        };
      }
      extensionEventEmitter.fire({
        type: 'recommendationCount',
        data: newState.recommendations.length,
      });
      extensionEventEmitter.fire({ type: 'recommendationCurrent', data: newState.current });

      return newState;
    });
  }

  setCurrent(index: number): Thenable<void> {
    return this.update(state => {
      let newState: RecommendationsState;
      if (state === undefined || index < 0 || index >= state.recommendations.length) {
        newState = state;
      } else {
        newState = { ...state, current: index };
      }
      extensionEventEmitter.fire({ type: 'recommendationCurrent', data: newState?.current });

      return newState;
    });
  }

  count(): number {
    return this.value()?.recommendations.length ?? 0;
  }

  getRecommendation(problemId: string): string | undefined {
    const state = this.value();
    if (!state || state.problemId !== problemId) {
      return undefined;
    }

    return state.recommendations[state.current];
  }
}
