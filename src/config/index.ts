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

export const getChatGPTToken = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('chatgptToken')

  return config
}

export const backendService = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('backendSelection')

  return config
}
