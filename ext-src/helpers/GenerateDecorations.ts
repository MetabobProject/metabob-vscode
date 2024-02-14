import * as vscode from 'vscode';
import { Problem } from '../types';
import { FixSuggestionCommandHandler } from '../commands';

export const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor('diffEditor.removedTextBackground'),
  isWholeLine: true,
  overviewRulerLane: 7,
  overviewRulerColor: 'red',
});

export function GenerateDecorations(
  results: Problem[],
  editor: vscode.TextEditor,
  jobId?: string,
): {
  decorationType: vscode.TextEditorDecorationType;
  decorations: vscode.DecorationOptions[];
} {
  const decorations: vscode.DecorationOptions[] = results.map(vulnerability => {
    const { startLine, endLine, path, id } = vulnerability;
    const range = new vscode.Range(
      startLine - 1,
      0,
      endLine - 1,
      editor.document.lineAt(vulnerability.endLine - 1).text.length,
    );

    const payload: FixSuggestionCommandHandler = {
      path,
      id,
      jobId,
      vuln: vulnerability,
    };

    const viewDescriptionURI = encodeURIComponent(JSON.stringify(payload));

    const hoverFixMessage = `**[Fix](command:metabob.fixSuggestion?${viewDescriptionURI} "This action will display a comprehensive view of the issue along with a recommended solution.")**`;
    const hoverViewDescriptionMessage = `**[More Details](command:metabob.showDetailSuggestion?${viewDescriptionURI} "This action will display a comprehensive view of the issue.")**`;
    const hoverMessage = new vscode.MarkdownString(
      `### **CATEGORY:** ${vulnerability.category}\n\n${vulnerability.summary}\n\n${hoverFixMessage} |\r${hoverViewDescriptionMessage}`,
    );
    hoverMessage.isTrusted = true;

    return {
      range,
      hoverMessage,
      renderOptions: {
        after: {
          contentText: '',
          color: 'red',
        },
      },
    } satisfies vscode.DecorationOptions;
  });

  return {
    decorationType,
    decorations,
  };
}
