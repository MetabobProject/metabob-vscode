import * as vscode from 'vscode';

export const getAPIConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('apiKey');
  return config;
};

export const getAPIBaseURL = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('baseURl');
  return config;
};

export const analyzeDocumentOnSave = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<boolean>('analyzeDocumentOnSave');
  return config;
};
