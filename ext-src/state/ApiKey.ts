import * as vscode from 'vscode';
import CONSTANTS from '../constants';
import { ExtensionState, ExtensionStateValue } from './Base';

export type APIKeyState = string;

// API Keys Global state, that is updated whenever the user changes config of the Extension.
export class APIKey extends ExtensionState<APIKeyState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.apiKey);
  }

  get(): ExtensionStateValue<APIKeyState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<APIKeyState>>(this.key);
  }

  set(value: APIKeyState): Thenable<void> {
    const stateValue = { key: this.key, value };

    return this.context.globalState.update(this.key, stateValue);
  }

  update(callback: (value: APIKeyState) => APIKeyState): Thenable<void | undefined> {
    const value = this.get();
    const updatedValue = callback(value?.value || '');

    return this.set(updatedValue);
  }
}
