import * as vscode from 'vscode';
import { getAPIConfig } from './config';
import { LeftPanelWebview } from './providers/leftWebView.provider';

export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug');
  const apiConfig = getAPIConfig();

  const leftPanelWebView = new LeftPanelWebview(context?.extensionUri, {});
  let view = vscode.window.registerWebviewViewProvider('left-panel-webview', leftPanelWebView);
  context.subscriptions.push(view);
}

export function deactivate() {}
