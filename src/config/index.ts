import * as vscode from 'vscode';

export const getAPIConfig = () => {
  const config = vscode.workspace.getConfiguration('metabob').get<string>('apiKey');
  return config;
};
