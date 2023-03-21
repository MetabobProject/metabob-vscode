import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { Problem } from '../types'
import { ExtensionState, ExtensionStateValue } from './base.state'

export type ICurrentQuestionState = {
  path?: string
  id?: string
  vuln?: Problem
}

export class currentQuestionState extends ExtensionState<ICurrentQuestionState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.currentQuestion)
  }

  get(): ExtensionStateValue<ICurrentQuestionState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<ICurrentQuestionState>>(this.key)
  }

  set(value: ICurrentQuestionState): Thenable<void> {
    const stateValue = { key: this.key, value }

    return this.context.globalState.update(this.key, stateValue)
  }

  update(callback: (value: ICurrentQuestionState) => ICurrentQuestionState): Thenable<void | undefined> {
    const value = this.get()
    const updatedValue = callback(value?.value || {})

    return this.set(updatedValue)
  }
}
