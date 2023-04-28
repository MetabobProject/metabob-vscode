import * as vscode from 'vscode'
import { Problem } from '../types'

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor('diffEditor.removedTextBackground'),
  isWholeLine: true,
  overviewRulerLane: 7,
  overviewRulerColor: 'red'
})

export function GenerateDecorations(results: Problem[], editor: vscode.TextEditor, jobId?: string) {
  const decorations: vscode.DecorationOptions[] = results.map(vulnerability => {
    const range = new vscode.Range(
      vulnerability.startLine - 1,
      0,
      vulnerability.endLine - 1,
      editor.document.lineAt(vulnerability.endLine - 1).text.length
    )

    const viewDescriptionURI = encodeURI(
      JSON.stringify({
        path: vulnerability.path,
        id: vulnerability.id,
        vuln: vulnerability,
        jobId
      })
    )

    const hoverDiscardMessage = `**[Fix](command:metabob.fixSuggestion?${viewDescriptionURI})**`
    const hoverViewDescriptionMessage = `**[More Details](command:metabob.focusRecomened?${viewDescriptionURI})**`
    const hoverMessage = new vscode.MarkdownString(
      `### **CATEGORY:** ${vulnerability.category}\n\n${vulnerability.summary}\n\n${hoverDiscardMessage} |\r${hoverViewDescriptionMessage}`
    )
    hoverMessage.isTrusted = true

    return {
      range,
      hoverMessage,
      renderOptions: {
        after: {
          contentText: '×',
          color: 'red'
        }
      }
    } satisfies vscode.DecorationOptions
  })

  return {
    decorationType,
    decorations
  }
}
