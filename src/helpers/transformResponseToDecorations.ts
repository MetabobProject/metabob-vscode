import { Problem } from '../types';
import { GenerateDecorations } from './GenerateDecorations';
import * as vscode from 'vscode';

export function transformResponseToDecorations(results: Problem[], editor: vscode.TextEditor) {
  const decor = GenerateDecorations(results, editor);
  return decor;
}
