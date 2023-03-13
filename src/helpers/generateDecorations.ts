import * as vscode from 'vscode';
import { Problem } from '../types';

export function GenerateDecorations(results: Problem[], editor: vscode.TextEditor) {
  const decorations: vscode.DecorationOptions[] = results.map(vulnerability => {
    const range = new vscode.Range(
      vulnerability.startLine - 1,
      0,
      vulnerability.endLine - 1,
      editor.document.lineAt(vulnerability.endLine - 1).text.length
    );

    const hoverMessage = new vscode.MarkdownString(
      `**Category:** ${vulnerability.category}\n\n${vulnerability.summary}`
    );
    hoverMessage.isTrusted = true;

    const applyFixButton = new vscode.CodeAction(
      `Apply fix for ${vulnerability.path}`,
      vscode.CodeActionKind.QuickFix
    );
    applyFixButton.isPreferred = true;

    applyFixButton.command = {
      title: `Apply fix for ${vulnerability.path}`,
      command: 'vulnerability.applyFix',
      arguments: [vulnerability],
    };

    return {
      range,
      hoverMessage,
      renderOptions: {
        after: {
          contentText: '×',
          color: 'red',
        },
      },
      // command: {
      //   title: `Apply fix for ${vulnerability.path}`,
      //   command: 'vulnerability.applyFix',
      //   arguments: [vulnerability],
      // },
    } satisfies vscode.DecorationOptions;
  });

  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('diffEditor.removedTextBackground'),
    isWholeLine: true,
    overviewRulerLane: 7,
    overviewRulerColor: 'red',
  });

  return {
    decorationType,
    decorations,
  };
}
