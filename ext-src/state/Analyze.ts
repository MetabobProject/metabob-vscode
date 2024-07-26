import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { ExtensionState, ExtensionStateValue } from './Base';
import { Problem } from '../types';
import { getExtensionEventEmitter } from '../events';

export type AnalysisData = {
  analyzedDocumentContent: string;
  isValid: boolean; // Represents whether or not the document has been changed since the analysis was performed
  expiration: string;
  problems: ProblemData[];
};

export type ProblemData = Problem & {
  isViewed?: boolean;
};

export type AnalyzeState = {
  [filepath: string]: AnalysisData[]; // Most recent analysis data will be at the first index of the array
};

const extensionEventEmitter = getExtensionEventEmitter();

// Whenever the user Analyze the file, we will store the response of the request in
// a store, so user will be able to see decorations upon changing files.
export class Analyze extends ExtensionState<AnalyzeState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.analyze);
  }

  get(): ExtensionStateValue<AnalyzeState> {
    return this.context.workspaceState.get<ExtensionStateValue<AnalyzeState>>(this.key, {
      key: this.key,
      value: {},
    });
  }

  set(value: AnalyzeState): Thenable<void> {
    const stateValue = { key: this.key, value };

    extensionEventEmitter.fire({
      type: 'ANALYZE_STATE_CHANGED',
      data: value,
    });

    return this.context.workspaceState.update(this.key, stateValue);
  }

  update(callback: (value: AnalyzeState) => AnalyzeState): Thenable<void | undefined> {
    const currentValue = this.get()?.value ?? {};
    const updatedValue = callback(currentValue);

    return this.set(updatedValue);
  }

  clear(): void {
    this.context.workspaceState.update(this.key, undefined);
  }

  value(): AnalyzeState {
    return this.get().value;
  }

  getFileProblems(path: string): ProblemData[] {
    return this.value()[path]?.[0]?.problems ?? [];
  }

  updateProblem(problemId: string, propertiesToUpdate: Partial<Omit<ProblemData, 'id'>>): void {
    this.update(state => {
      for (const path in state) {
        for (const analysisData of state[path]) {
          const problem = analysisData.problems.find(problem => problem.id === problemId);
          if (problem) {
            Object.assign(problem, propertiesToUpdate);

            return state;
          }
        }
      }

      return state;
    });
  }

  storeAnalysis(path: string, analysisData: AnalysisData): void {
    this.update(state => {
      if (!state[path]) {
        state[path] = [];
      }

      state[path].unshift(analysisData);

      return state;
    });
  }
}
