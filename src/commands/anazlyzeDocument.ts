import * as vscode from 'vscode';
import * as path from 'path';
import { Util } from '../utils';
import { submitService } from '../services/submit/submit.service';

interface ActivateAnalyzeCommandPayload {
  text: boolean;
  code: boolean;
  document: vscode.TextDocument;
}

function extractMetaDataFromDocument(document: vscode.TextDocument) {
  const filePath = document.fileName;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : '';
  const fileContent = document.getText();
  const isTextDocument = Util.isTextDocument(document);
  return {
    filePath,
    relativePath,
    fileContent,
    isTextDocument,
  };
}

export function activateAnalyzeCommand(
  context: vscode.ExtensionContext,
  _config: {
    apiConfig: string | undefined;
    baseUrl: string | undefined;
    analyzeDocumentOnSave: boolean | undefined;
  },
  _debug?: vscode.OutputChannel
) {
  const command = 'metabob.analyzeDocument';

  const commandHandler = async (payload?: ActivateAnalyzeCommandPayload) => {
    // get the current editor
    if (!payload) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Editor is not Selected');
        return;
      }
      const metaDataDocument = extractMetaDataFromDocument(editor.document);
      if (metaDataDocument.isTextDocument) {
        const response = await submitService.submitTextFile(
          metaDataDocument.relativePath,
          metaDataDocument.fileContent,
          metaDataDocument.filePath
        );
        if (response.isOk()) {
          if (response.value?.results) {
            const decorations: vscode.DecorationOptions[] = response.value.results.map(
              (result: any) => {
                const startLine = result.startLine;
                const endLine = result.endLine;
                const category = result.category;
                const summary = result.summary;

                // Create a decoration type for each category
                const decorationType = vscode.window.createTextEditorDecorationType({
                  backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  overviewRulerColor: 'red',
                  overviewRulerLane: vscode.OverviewRulerLane.Right,
                });

                // Create decoration options for each line range
                const lineRange = new vscode.Range(startLine, 0, endLine, 0);
                const decorationOption = { range: lineRange, hoverMessage: summary };
                const lineDecorations = [decorationOption];

                // Return the decoration options for this result
                return { range: lineRange, hoverMessage: summary, decorationType, lineDecorations };
              }
            );
            // Get the active text editor
            const activeEditor = vscode.window.activeTextEditor;

            // Decorate the active editor with the results
            if (activeEditor) {
            }
          }
        }
      } else {
        const response = await submitService.submitCodeFile();
      }
    }

    if (payload && payload.code === true && payload.text === false) {
    }

    if (payload && payload.code === false && payload.text === false) {
      const metaDataDocument = extractMetaDataFromDocument(payload.document);
      if (metaDataDocument.isTextDocument) {
        const response = await submitService.submitTextFile(
          metaDataDocument.relativePath,
          metaDataDocument.fileContent,
          metaDataDocument.filePath
        );
      }
    }

    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
  };
}
