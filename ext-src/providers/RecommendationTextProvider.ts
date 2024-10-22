import { Event, EventEmitter, ExtensionContext, TextDocumentContentProvider, Uri } from 'vscode';
import { Analyze, Recommendations } from '../state';

export class RecommendationTextProvider implements TextDocumentContentProvider {
  private _onDidChange = new EventEmitter<Uri>();
  public readonly onDidChange: Event<Uri> = this._onDidChange.event;

  private _analyzeState: Analyze;
  private _recommendationState: Recommendations;

  constructor(context: ExtensionContext) {
    this._analyzeState = new Analyze(context);
    this._recommendationState = new Recommendations(context);
  }

  async provideTextDocumentContent(uri: Uri): Promise<string | null | undefined> {
    const problemId = uri.query;
    const problem = this._analyzeState.getProblem(problemId, uri.path);
    const currDocumentText = this._analyzeState.getLatestAnalysis(
      uri.path,
    )?.analyzedDocumentContent;
    const recommendation = this._recommendationState.getRecommendation(problemId);
    if (!problem || !currDocumentText || !recommendation) {
      return;
    }

    return this._replaceLines(currDocumentText, problem.startLine, problem.endLine, recommendation);
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

  update(uri: Uri): void {
    this._onDidChange.fire(uri);
  }
}
