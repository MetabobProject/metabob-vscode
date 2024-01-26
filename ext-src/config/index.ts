import * as vscode from 'vscode';

export const GetAPIConfig = (): string | undefined => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('apiKey');

  return config;
};

export const GetAPIBaseURLConfig = (): string | undefined => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('baseURl');

  return config;
};

export const AnalyzeDocumentOnSaveConfig = (): boolean | undefined => {
  const config = vscode.workspace.getConfiguration('metabob').get<boolean>('analyzeDocumentOnSave');

  return config;
};

export const GetChatGPTToken = (): string | undefined => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('chatgptToken');

  return config;
};

export const BackendService = (): string | undefined => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('backendSelection');

  return config;
};

export const GetRequestParamId = (): string | undefined => {
  if (vscode.env.isTelemetryEnabled) {
    return vscode.env.machineId;
  }

  return undefined;
};
