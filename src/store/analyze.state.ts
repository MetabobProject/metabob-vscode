import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { ExtensionState, ExtensionStateValue } from './base.state'

export type IAnalyzeState = {
  [filepath: string]: [
    {
      id: string
      path: string
      startLine: number
      endLine: number
      category: string
      summary: string
      description: string
      isDiscarded?: boolean
    }
  ]
}

export class AnalyzeState extends ExtensionState<IAnalyzeState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.apiKey)
  }

  get(): ExtensionStateValue<IAnalyzeState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<IAnalyzeState>>(this.key)
  }

  set(value: IAnalyzeState): Thenable<void> {
    const stateValue = { key: this.key, value }

    return this.context.globalState.update(this.key, stateValue)
  }

  update(callback: (value: IAnalyzeState) => IAnalyzeState): Thenable<void | undefined> {
    const value = this.get()
    const updatedValue = callback(value?.value || {})

    return this.set(updatedValue)
  }
}
