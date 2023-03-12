import * as vscode from 'vscode';

export interface ExtensionStateValue<T> {
  key: string;
  value: T;
}

export class ExtensionState<T> {
  protected readonly context: vscode.ExtensionContext;
  protected readonly key: string;

  constructor(context: vscode.ExtensionContext, key: string) {
    this.context = context;
    this.key = key;
  }

  get(): ExtensionStateValue<T> | undefined {
    return this.context.globalState.get<ExtensionStateValue<T>>(this.key);
  }

  set(value: T): Thenable<void> {
    const stateValue: ExtensionStateValue<T> = { key: this.key, value };
    return this.context.globalState.update(this.key, stateValue);
  }

  update(callback: (value: T) => T): Thenable<void | undefined> {
    const value = this.get();
    const updatedValue = callback(value as T);
    return this.set(updatedValue);
  }
}
