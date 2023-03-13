import { Problem } from '../types';
import { GenerateDecorations } from './generateDecorations';
import * as vscode from 'vscode';

export function transformResponseToDecorations(results: Problem[], editor: vscode.TextEditor) {
  const decor = GenerateDecorations(results, editor);
  return decor;
}
