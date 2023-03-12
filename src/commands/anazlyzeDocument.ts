import * as vscode from 'vscode';
import * as path from 'path';
import { Util } from '../utils';
import { submitService } from '../services/submit/submit.service';
import { SubmitCodeRepresentationPayload, SubmitRepresentationResponse } from '../types';
import { Result } from 'rusty-result-ts';
import { ApiErrorBase } from '../services/base.error';
import { GenerateDecorations } from '../helpers/generateDecorations';
import { withProgress } from '../helpers/withProgress';
import { SessionState } from '../store/session.state';

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

function computeDocumentResponse(
  response: Result<SubmitRepresentationResponse | null, ApiErrorBase>
) {
  if (response.isOk()) {
    if (response.value?.results) {
      const decor = GenerateDecorations(response.value.results);
      return decor;
    }
  }
  if (response.isErr()) {
    // if(response.error.)
    return;
  }

  return undefined;
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
  const computeOutput = computeDocumentResponse(response);
  return;
};

const handleCodeDocumentAnalyze = async (
  metaDataDocument: IDocumentMetaData,
  sessionToken: string
) => {
  const codeRepresentation: SubmitCodeRepresentationPayload = {
    format: 'full',
    identities: {
      [metaDataDocument.filePath]: {
        language: metaDataDocument.languageId,
        filePath: metaDataDocument.filePath,
        startLine: 0,
        endLine: metaDataDocument.endLine,
        text: metaDataDocument.fileContent,
      },
    },
    nodes: {
      [metaDataDocument.filePath]: [
        {
          type: 'FILE',
          identity: metaDataDocument.filePath,
        },
      ],
    },
    edges: {},
  };

  const response = await submitService.submitCodeFile(codeRepresentation, sessionToken);

  if (response.isOk()) {
    const computeOutput = computeDocumentResponse(response);
    // const editor = vscode.window.activeTextEditor;
  }

  if (response.isErr()) {
  }
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
      if (documentMetaData.isTextDocument) {
        const sessionState = new SessionState(context).get();
        if (sessionState) {
          withProgress<void>(
            handleTextDocumentAnalyze(documentMetaData, sessionState.value),
            'Metabob: Analyzing Document'
          );
        }
      } else {
        const sessionState = new SessionState(context).get();
        if (sessionState) {
          withProgress<void>(
            handleCodeDocumentAnalyze(documentMetaData, sessionState.value),
            'Metabob: Analyzing Document'
          );
        }
      }
    } else {
      vscode.window.showErrorMessage('Metabob: Selected Document is invalid');
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
