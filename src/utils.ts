import * as path from 'path'
import * as vscode from 'vscode'
import { IDocumentMetaData, Problem } from './types'
import { CONSTANTS } from './constants'
import { languages, TextDocument } from 'vscode'
import { GenerateDecorations } from './helpers/GenerateDecorations'

// Normal Utilities used shared across folders
export class Util {
  static context: vscode.ExtensionContext

  static getSessionToken() {
    return this.context.globalState.get<string>(CONSTANTS.sessionKey) || ''
  }

  static updateSessionToken(sessionToken: string) {
    return this.context.globalState.update(CONSTANTS.sessionKey, sessionToken)
  }

  static isLoggedIn() {
    return !!this.context.globalState.get(CONSTANTS.sessionKey) && !!this.context.globalState.get(CONSTANTS.apiKey)
  }

  static isValidDocument(doc: TextDocument): boolean {
    const textLanguageIds = ['markdown', 'asciidoc']

    return !(languages.match(textLanguageIds, doc) > 0)
  }

  static isTextDocument(doc: TextDocument): boolean {
    const textLanguageIds = ['plaintext']

    return languages.match(textLanguageIds, doc) > 0
  }

  static getNonce() {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }

  static sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

  static getWorkspacePath() {
    const folders = vscode.workspace.workspaceFolders

    return folders ? folders![0].uri.fsPath : undefined
  }

  static getResource(rel: string) {
    return path.resolve(this.context.extensionPath, rel.replace(/\//g, path.sep)).replace(/\\/g, '/')
  }

  static extractMetaDataFromDocument(document: vscode.TextDocument): IDocumentMetaData {
    const filePath = document.fileName
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
    const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : ''
    const fileContent = document.getText()
    const isTextDocument = Util.isTextDocument(document)
    const languageId = document.languageId
    const endLine = document.lineCount - 1

    return {
      filePath,
      relativePath,
      fileContent,
      isTextDocument,
      languageId,
      endLine
    }
  }
  static async withProgress<T>(task: Promise<T>, title: string): Promise<T> {
    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: title,
        cancellable: false
      },
      async () => {
        return await task
      }
    )
  }

  static transformResponseToDecorations(results: Problem[], editor: vscode.TextEditor, jobId?: string) {
    const decor = GenerateDecorations(results, editor, jobId)

    return decor
  }
}
