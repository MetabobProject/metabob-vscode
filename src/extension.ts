import * as vscode from 'vscode';
import { getAPIConfig } from './config';
import { LeftPanelWebview } from './providers/main.provider';

export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug');
  const apiConfig = getAPIConfig();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'left-panel-webview',
      new LeftPanelWebview(context?.extensionUri)
    )
  );
}

export function deactivate() {}
