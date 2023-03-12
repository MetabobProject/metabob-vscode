import * as vscode from 'vscode';
import { getAPIConfig, getAPIBaseURL, analyzeDocumentOnSave } from './config';
import { SuggestionWebView } from './providers/suggestion.provider';
import { RecommendationWebView } from './providers/recommendation.provider';
import { activateAnalyzeCommand } from './commands/anazlyzeDocument';
import { Util } from './utils';
import { createUserSession } from './helpers/createSession';

let sessionInterval: any | null = null;
export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug');
  const apiConfig = getAPIConfig();
  const baseUrl = getAPIBaseURL();
  const analyzeDocumentOnSaveConfig = analyzeDocumentOnSave();

  const config = {
    apiConfig,
    baseUrl,
    analyzeDocumentOnSave: analyzeDocumentOnSaveConfig,
  };

  activateAnalyzeCommand(context, config, debug);

  createUserSession(context);
  sessionInterval = setInterval(() => {
    createUserSession(context);
  }, 10_000);

  if (analyzeDocumentOnSaveConfig && analyzeDocumentOnSaveConfig === true) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        if (Util.isTextDocument(document)) {
          // call text document api
          vscode.commands.executeCommand('metabob.analyzeDocument', {
            text: true,
            code: false,
            document,
          });
        } else {
          // call code service api
          vscode.commands.executeCommand('metabob.analyzeDocument', {
            code: true,
            text: false,
            document,
          });
        }
      })
    );
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('metabob.apiKey') === true) {
        vscode.window.showInformationMessage('Metabob: API Key Changed');
      }
      if (e.affectsConfiguration('metabob.baseURl') === true) {
        vscode.window.showInformationMessage('Metabob: Base URL Changed');
      }
    })
  );

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

export function deactivate() {
  if (sessionInterval) {
    clearInterval(sessionInterval);
  }
}
