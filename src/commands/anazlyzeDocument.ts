import * as vscode from 'vscode';
import * as path from 'path';
import { Util } from '../utils';
import { submitService } from '../services/submit/submit.service';
import { SubmitRepresentationResponse } from '../types';
import { Result } from 'rusty-result-ts';
import { ApiErrorBase } from '../services/base.error';
import { GenerateDecorations } from '../helpers/generateDecorations';
import { debug } from 'console';

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

// If the status is completed, passes the response to another function
// if the status is pending then queue the job
function computeTextDocumentResponse(
  response: Result<SubmitRepresentationResponse | null, ApiErrorBase>
) {
  if (response.isOk()) {
    if (response.value?.results) {
      // const decor = GenerateDecorations(response.value.results);
    }
  } else {
    // check the value of the error, if it is pending
    // append the job to queue else remove from queue
  }
}

export function activateAnalyzeCommand(
  context: vscode.ExtensionContext,
  _config: {
    apiConfig: string | undefined;
    baseUrl: string | undefined;
    analyzeDocumentOnSave: boolean | undefined;
  },
  debug?: vscode.OutputChannel
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
        debug?.appendLine(JSON.stringify(response));
      } else {
        // const response = await submitService.submitCodeFile();
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
