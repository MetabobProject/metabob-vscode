import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { Problem } from '../types';
import { ExtensionState, ExtensionStateValue } from './Base';

// Whenever the Metabob extension is opened by the user, we want to
// add previous question performed by the user, so upon asking question,
// we update this state and upon activate we perform get from this state
export type CurrentQuestionState =
  | {
      path: string;
      id: string;
      vuln: Problem;
      isFix: boolean;
      isReset: boolean;
    }
  | undefined;

export class CurrentQuestion extends ExtensionState<CurrentQuestionState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.currentQuestion);
  }

  get(): ExtensionStateValue<CurrentQuestionState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<CurrentQuestionState>>(this.key);
  }

  set(value: CurrentQuestionState): Thenable<void> {
    const stateValue = { key: this.key, value };

    return this.context.globalState.update(this.key, stateValue);
  }

  update(
    callback: (value: CurrentQuestionState) => CurrentQuestionState,
  ): Thenable<void | undefined> {
    const value = this.get();
    const updatedValue = callback(value?.value || undefined);

    return this.set(updatedValue);
  }

  clear(): void {
    this.set(undefined);
  }
}
