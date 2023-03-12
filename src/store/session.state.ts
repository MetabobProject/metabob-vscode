import * as vscode from 'vscode';
import { CONSTANTS } from '../constants';
import { ExtensionState } from './base.state';

export class SessionState extends ExtensionState<string> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.sessionKey);
  }

  get(): string | undefined {
    return this.context.globalState.get<string>(CONSTANTS.sessionKey);
  }

  set(value: string): Thenable<void> {
    const stateValue = { key: this.key, value };
    return this.context.globalState.update(this.key, stateValue);
  }

  update(callback: (value: string) => string): Thenable<void | undefined> {
    const value = this.get();
    const updatedValue = callback(value as string);
    return this.set(updatedValue);
  }
}
