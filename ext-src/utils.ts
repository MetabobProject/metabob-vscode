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
import { GenerateDecorations, decorationType } from './helpers';
import CONSTANTS from './constants';
import { AnalyzeState } from './state';

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
    const path = folders ? folders![0].uri.fsPath : undefined;
    if (path === undefined) {
      return undefined
    }
    const splitPath: string | undefined = path.split(/\/|\\/g).pop()?.replace('.git', '');

    if (splitPath === undefined) {
      return undefined
    }

    return splitPath
  }

  static extractMetaDataFromDocument(document: vscode.TextDocument): IDocumentMetaData {
    const filePath = document.uri.fsPath;
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : '';
    const splitKey: string | undefined = relativePath.split(/\/|\\/g).pop();
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
      fileName: splitKey
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

  static getRootFolderName(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
      const rootFolder = workspaceFolders[0];
      
      return rootFolder.name;
    }

    return undefined; // No workspace folder
  }

  static getCurrentFile(): {
    fileName: string;
    absPath: string;
    editor: vscode.TextEditor
  } | undefined {
    const editor = vscode.window.activeTextEditor
    if (!editor) return undefined;
    if (!this.isValidDocument(editor.document)) {
      return undefined;
    }

    const documentMetaData = this.extractMetaDataFromDocument(editor.document);
    const fileName: string | undefined = documentMetaData.fileName;
    if (!fileName) return undefined

    return {
      fileName,
      absPath: documentMetaData.filePath,
      editor
    }
  }

  static getCurrentEditorProblems(analyzeValue: AnalyzeState, currentFilePath: string): Problem[] | undefined {
    const results: Problem[] = [];

    for (const value of Object.values(analyzeValue)) {
      if (value.path === undefined) continue;

      // verifying that we only show current opened file decorations that are not discarded.
      if (value.path === currentFilePath && value.isDiscarded === false) {
        const problem: Problem = {
          ...value,
          startLine: value.startLine < 0 ? value.startLine * -1 : value.startLine,
          endLine: value.endLine < 0 ? value.endLine * -1 : value.endLine,
          discarded: value.isDiscarded || false,
          endorsed: value.isEndorsed || false,
        };

        results.push(problem);
      }
    }

    return results
  }

  static decorateCurrentEditorWithHighlights(problems: Problem[], problemEditor: vscode.TextEditor, _debug?: vscode.OutputChannel): boolean {
    const currentEditor = vscode.window.activeTextEditor;
    if (!currentEditor) return false;

    _debug?.appendLine('problem file <> Editor file: ' + problemEditor.document.fileName + ' <> ' + currentEditor.document.fileName);
    const isUserOnProblemEditor = problemEditor.document.fileName === currentEditor.document.fileName

    if (!isUserOnProblemEditor) return false;

    const { decorations } = GenerateDecorations(problems, currentEditor);
    _debug?.appendLine('Decorations: ' + JSON.stringify(decorations));
    problemEditor.setDecorations(decorationType, []);
    problemEditor.setDecorations(decorationType, decorations);

    return true
  }
}
