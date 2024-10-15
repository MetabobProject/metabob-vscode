import { ExtensionContext, TextDocumentContentProvider, Uri } from 'vscode';
import { Analyze } from '../state';

export class RecommendationTextProvider implements TextDocumentContentProvider {
  private _analyzeState: Analyze;

  constructor(context: ExtensionContext) {
    this._analyzeState = new Analyze(context);
  }

  async provideTextDocumentContent(uri: Uri): Promise<string | null | undefined> {
    const currDocumentText = this._analyzeState.value()[uri.path]?.[0]?.analyzedDocumentContent;
    const { recommendation, startLine, endLine } = JSON.parse(uri.query) as {
      recommendation: string;
      startLine: number;
      endLine: number;
    };

    return this._replaceLines(currDocumentText, startLine, endLine, recommendation);
  }

  /** Replaces the lines from startLine to endLine in documentText with newContent. */
  private _replaceLines(
    documentText: string,
    startLine: number,
    endLine: number,
    newContent: string,
  ): string {
    // remove the last newline character since it gets added by the .join('\n')
    newContent = newContent.replace(/\n$/, '');

    const lines = documentText.split('\n');
    const newLines = lines.slice(0, startLine).concat([newContent]).concat(lines.slice(endLine));

    return newLines.join('\n');
  }
}
