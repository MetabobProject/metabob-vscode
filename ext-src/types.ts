import { TextDocument } from 'vscode'

export interface Problem {
  id: string
  path: string
  startLine: number
  endLine: number
  category: string
  summary: string
  description: string
}
export interface Identity {
  [id: string]: {
    language: string
    filePath: string
    startLine: number
    endLine: number
    text: any
  }
}

export interface Node {
  [id: string]: Array<{
    type: 'FILE'
    identity: string
  }>
}

export interface Edge {
  [id: string]: any[]
}

export interface IAnalyzeTextDocumentOnSave {
  document: TextDocument
}

export interface IDocumentMetaData {
  filePath: string
  relativePath: string
  fileContent: string
  isTextDocument: boolean
  languageId: string
  endLine: number
}
