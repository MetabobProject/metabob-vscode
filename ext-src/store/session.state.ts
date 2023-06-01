import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { ExtensionState, ExtensionStateValue } from './base.state'

// Store the Session of the user, that is changed by the user from the config.
// Used to add Authorization Header in the requests
export class SessionState extends ExtensionState<string> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.sessionKey)
  }

  get(): ExtensionStateValue<string> | undefined {
    return this.context.globalState.get<ExtensionStateValue<string>>(CONSTANTS.sessionKey)
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

  clear(): void {
    this.context.globalState.update(this.key, undefined)
  }
}
