import * as vscode from 'vscode';
import { AnalyzeState } from '../store/analyze.state';
import { SessionState } from '../store/session.state';
import { IAnalyzeTextDocumentOnSave } from '../types';
import { extractMetaDataFromDocument } from './ExtractMetaDataFromDocument';
import { handleDocumentAnalyze } from './HandleDocumentAnalyze';
import { withProgress } from './WithProgress';

export function AnalyzeDocumentOnSave(
  _payload: IAnalyzeTextDocumentOnSave,
  context: vscode.ExtensionContext
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const documentMetaData = extractMetaDataFromDocument(editor.document);
  const sessionState = new SessionState(context).get();
  const analyzeState = new AnalyzeState(context);

  if (sessionState) {
    withProgress<void>(
      handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
      'Metabob: Analyzing Document'
    );
  }
}
