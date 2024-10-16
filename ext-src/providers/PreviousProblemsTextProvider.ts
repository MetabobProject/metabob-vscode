import { ProviderResult, TextDocumentContentProvider, Uri } from 'vscode';
import { Analyze } from '../state';

export class AnalyzedDocumentTextProvider implements TextDocumentContentProvider {
  private analysisStore: Analyze;

  constructor(analysisStore: Analyze) {
    this.analysisStore = analysisStore;
  }

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    const analyses = this.analysisStore.value()[uri.path] ?? [];
    if (analyses.length === 0) return '';

    if (analyses[0].isValid && analyses.length > 1) {
      return analyses[1].analyzedDocumentContent;
    } else if (!analyses[0].isValid) {
      return analyses[0].analyzedDocumentContent;
    } else {
      return '';
    }
  }
}
