import * as vscode from 'vscode';
export function AnalyzeTextDocumentOnSave(_payload: {
  text: boolean;
  code: boolean;
  document: vscode.TextDocument;
}) {}
