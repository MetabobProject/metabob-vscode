import * as vscode from 'vscode';
import * as path from 'path';
import { Util } from '../utils';
import { submitService } from '../services/submit/submit.service';
import { withProgress } from '../helpers/withProgress';
import { SessionState } from '../store/session.state';
import { transformResponseToDecorations } from '../helpers/transformResponseToDecorations';

interface IDocumentMetaData {
  filePath: string;
  relativePath: string;
  fileContent: string;
  isTextDocument: boolean;
  languageId: string;
  endLine: number;
}

function extractMetaDataFromDocument(document: vscode.TextDocument): IDocumentMetaData {
  const filePath = document.fileName;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : '';
  const fileContent = document.getText();
  const isTextDocument = Util.isTextDocument(document);
  const languageId = document.languageId;
  const endLine = document.lineCount - 1;

  return {
    filePath,
    relativePath,
    fileContent,
    isTextDocument,
    languageId,
    endLine,
  };
}

const handleTextDocumentAnalyze = async (
  metaDataDocument: IDocumentMetaData,
  sessionToken: string
) => {
  const response = await submitService.submitTextFile(
    metaDataDocument.relativePath,
    metaDataDocument.fileContent,
    metaDataDocument.filePath,
    sessionToken
  );
  // verify if we need to queue the request

  // create decoration
  const decorationFromResponse = transformResponseToDecorations(response);

  // update global state for this relative path response

  // if current editor is relative path then show decorations
  return;
};

export function activateAnalyzeCommand(
  context: vscode.ExtensionContext,
  _debug?: vscode.OutputChannel
) {
  const command = 'metabob.analyzeDocument';

  const commandHandler = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('Editor is not Selected');
      return;
    }

    if (Util.isValidDocument(editor.document)) {
      const documentMetaData = extractMetaDataFromDocument(editor.document);
      const sessionState = new SessionState(context).get();
      if (sessionState) {
        withProgress<void>(
          handleTextDocumentAnalyze(documentMetaData, sessionState.value),
          'Metabob: Analyzing Document'
        );
      }
    } else {
      vscode.window.showErrorMessage('Metabob: Selected Document Is Invalid');
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
