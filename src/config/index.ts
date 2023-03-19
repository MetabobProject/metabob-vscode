import * as vscode from 'vscode'

export const getAPIConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('apiKey')

  return config
}

export const getAPIBaseURLConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('baseURl')

  return config
}

export const analyzeDocumentOnSaveConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<boolean>('analyzeDocumentOnSave')

  return config
}
