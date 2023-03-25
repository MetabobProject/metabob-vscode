import { Problem } from '../types'
import { GenerateDecorations } from './GenerateDecorations'
import * as vscode from 'vscode'

export function transformResponseToDecorations(results: Problem[], editor: vscode.TextEditor, jobId?: string) {
  const decor = GenerateDecorations(results, editor, jobId)

  return decor
}
