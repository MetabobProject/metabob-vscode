import * as vscode from 'vscode'

export const GetAPIConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('apiKey')

  return config
}

export const GetAPIBaseURLConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('baseURl')

  return config
}

export const AnalyzeDocumentOnSaveConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<boolean>('analyzeDocumentOnSave')

  return config
}

export const GetChatGPTToken = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('chatgptToken')

  return config
}

export const BackendService = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('backendSelection')

  return config
}

export const GetRequestParamId = (): string | undefined => {
  if (vscode.env.isTelemetryEnabled) {
    return vscode.env.machineId
  }

  return undefined
}
