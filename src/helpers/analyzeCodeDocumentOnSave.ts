import * as vscode from 'vscode';
export function AnalyzeCodeDocumentOnSave(_payload: {
  text: boolean;
  code: boolean;
  document: vscode.TextDocument;
}) {}
