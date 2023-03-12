import * as vscode from 'vscode';
import { CONSTANTS } from '../constants';
import { ExtensionState } from './base.state';

export class ApiKeyState extends ExtensionState<string> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.apiKey);
  }

  get(): string | undefined {
    return this.context.globalState.get<string>(this.key);
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
