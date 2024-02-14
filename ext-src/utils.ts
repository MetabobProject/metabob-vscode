import * as path from 'path';
import * as vscode from 'vscode';
import { IDocumentMetaData, Problem } from './types';
import {
  languages,
  TextDocument,
  workspace,
  window,
  ProgressLocation,
  ExtensionContext,
} from 'vscode';
import { GenerateDecorations } from './helpers';
import CONSTANTS from './constants';

// Normal Utilities used shared across folders
export default class Utils {
  static context: ExtensionContext;

  static getSessionToken(): string {
    return this.context.globalState.get<string>(CONSTANTS.sessionKey) || '';
  }

  static async updateSessionToken(sessionToken: string): Promise<void> {
    return await this.context.globalState.update(CONSTANTS.sessionKey, sessionToken);
  }

  static hasWorkspaceFolder(): boolean {
    return vscode.workspace.workspaceFolders !== undefined;
  }

  static hasOpenTextDocuments(): boolean {
    return !!vscode.window.activeTextEditor;
  }

  static isLoggedIn(): boolean {
    return (
      !!this.context.globalState.get(CONSTANTS.sessionKey) &&
      !!this.context.globalState.get(CONSTANTS.apiKey)
    );
  }

  static isValidDocument(doc: TextDocument): boolean {
    const textLanguageIds = ['markdown', 'asciidoc'];

    return !(languages.match(textLanguageIds, doc) > 0);
  }

  static isTextDocument(doc: TextDocument): boolean {
    const textLanguageIds = ['plaintext'];

    return languages.match(textLanguageIds, doc) > 0;
  }

  static getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  static sleep = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

  static getWorkspacePath(): string | undefined {
    const folders = workspace.workspaceFolders;

    return folders ? folders![0].uri.fsPath : undefined;
  }

  static getResource(rel: string): string {
    return path
      .resolve(this.context.extensionPath, rel.replace(/\//g, path.sep))
      .replace(/\\/g, '/');
  }

  static extractMetaDataFromDocument(document: vscode.TextDocument): IDocumentMetaData {
    const filePath = document.fileName;
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : '';
    const fileContent = document.getText();
    const isTextDocument = Utils.isTextDocument(document);
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
  static async withProgress<T>(task: Promise<T>, title: string): Promise<T> {
    return await window.withProgress(
      {
        location: ProgressLocation.Window,
        title: title,
        cancellable: false,
      },
      async () => {
        return await task;
      },
    );
  }

  static transformResponseToDecorations(
    results: Problem[],
    editor: vscode.TextEditor,
    jobId?: string,
  ): {
    decorationType: vscode.TextEditorDecorationType;
    decorations: vscode.DecorationOptions[];
  } {
    const decor = GenerateDecorations(results, editor, jobId);

    return decor;
  }

  static openFileInNewTab(filePath: string): Thenable<vscode.TextEditor | undefined> {
    const uri = vscode.Uri.file(filePath);

    return vscode.workspace.openTextDocument(uri).then(document => {
      return vscode.window.showTextDocument(document, vscode.ViewColumn.One);
    });
  }
}
