import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { ExtensionState, ExtensionStateValue } from './base.state'

// API Keys Global state, that is updated whenever the user changes config of the Extension.
export class ApiKeyState extends ExtensionState<string> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.apiKey)
  }

  get(): ExtensionStateValue<string> | undefined {
    return this.context.globalState.get<ExtensionStateValue<string>>(this.key)
  }

  set(value: string): Thenable<void> {
    const stateValue = { key: this.key, value }

    return this.context.globalState.update(this.key, stateValue)
  }

  update(callback: (value: string) => string): Thenable<void | undefined> {
    const value = this.get()
    const updatedValue = callback(value?.value || '')

    return this.set(updatedValue)
  }
}
