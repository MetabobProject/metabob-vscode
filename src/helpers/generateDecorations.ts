import * as vscode from 'vscode';
import { Problem } from '../types';

export function GenerateDecorations(results: Problem[]) {
  const problems = results.map(result => {
    const range = new vscode.Range(result.startLine, 0, result.endLine, 0);
    const problem = new vscode.Diagnostic(range, result.summary, vscode.DiagnosticSeverity.Error);
    problem.code = result.category;
    problem.source = 'Metabob';
    // problem.description = result.description;
    return problem;
  });

  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  });

  const decorations: vscode.DecorationOptions[] = problems.map(problem => ({
    range: problem.range,
    hoverMessage: problem.message,
  }));

  return {
    decorationType,
    decorations,
  };
}
