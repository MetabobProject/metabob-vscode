import * as vscode from 'vscode';
import { getAPIConfig } from './config';
import { SuggestionWebView } from './providers/suggestion.provider';
import { RecommendationWebView } from './providers/recommendation.provider';

export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug');
  const apiConfig = getAPIConfig();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'suggestion-panel-webview',
      new SuggestionWebView(context?.extensionUri)
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'recommendation-panel-webview',
      new RecommendationWebView(context?.extensionUri)
    )
  );
}

export function deactivate() {}
