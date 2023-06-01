import * as vscode from 'vscode'
import { CONSTANTS } from '../constants'
import { ExtensionState, ExtensionStateValue } from './base.state'

export type IRecommendationState = [
  {
    content?: string
    path?: string
    problemId?: string
    startLine?: number
    endLine?: number
    category?: string
    summary?: string
    recommendations?: string
  }
]

// This is used when user performs recommendation from the Metabob, this state store the current value.
export class RecommendationState extends ExtensionState<IRecommendationState> {
  constructor(context: vscode.ExtensionContext) {
    super(context, CONSTANTS.recommendations)
  }

  get(): ExtensionStateValue<IRecommendationState> | undefined {
    return this.context.globalState.get<ExtensionStateValue<IRecommendationState>>(this.key)
  }

  set(value: IRecommendationState): Thenable<void> {
    const stateValue = { key: this.key, value }

    return this.context.globalState.update(this.key, stateValue)
  }

  update(callback: (value: IRecommendationState) => IRecommendationState): Thenable<void | undefined> {
    const value = this.get()
    const updatedValue = callback(value?.value || [{}])

    return this.set(updatedValue)
  }
}
