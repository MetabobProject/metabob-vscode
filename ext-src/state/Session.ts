import * as vscode from 'vscode'
import CONSTANTS from '../constants'
import { ExtensionState, ExtensionStateValue } from './Base'

export type SessionState = string

// Store the Session of the user, that is changed by the user from the config.
// Used to add Authorization Header in the requests
export class Session extends ExtensionState<SessionState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.sessionKey)
  }

  get(): ExtensionStateValue<SessionState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<SessionState>>(CONSTANTS.sessionKey)
  }

  set(value: SessionState): Thenable<void> {
    const stateValue = { key: this.key, value }

    return this.context.globalState.update(this.key, stateValue)
  }

  update(callback: (value: SessionState) => SessionState): Thenable<void | undefined> {
    const value = this.get()
    const updatedValue = callback(value?.value || '')

    return this.set(updatedValue)
  }

  clear(): void {
    this.context.globalState.update(this.key, undefined)
  }
}
