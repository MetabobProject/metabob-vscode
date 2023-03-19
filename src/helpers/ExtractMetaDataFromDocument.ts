import * as vscode from 'vscode'
import * as path from 'path'
import { Util } from '../utils'
import { IDocumentMetaData } from '../types'

export function extractMetaDataFromDocument(document: vscode.TextDocument): IDocumentMetaData {
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
