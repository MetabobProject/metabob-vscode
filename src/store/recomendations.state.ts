import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { ExtensionState, ExtensionStateValue } from './base.state'

export type IRecomendationState = [
  {
    content?: string
    path?: string
    problemId?: string
    startLine?: number
    endLine?: number
    category?: string
    summary?: string
    recomendations?: string
  }
]

export class RecomendationState extends ExtensionState<IRecomendationState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.recomendations)
  }

  get(): ExtensionStateValue<IRecomendationState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<IRecomendationState>>(this.key)
  }

  set(value: IRecomendationState): Thenable<void> {
    const stateValue = { key: this.key, value }

    return this.context.globalState.update(this.key, stateValue)
  }

  update(callback: (value: IRecomendationState) => IRecomendationState): Thenable<void | undefined> {
    const value = this.get()
    const updatedValue = callback(value?.value || [{}])

    return this.set(updatedValue)
  }
}
