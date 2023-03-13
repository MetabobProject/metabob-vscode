import * as vscode from 'vscode';
import { analyzeDocumentOnSaveConfig } from './config';
import { SuggestionWebView } from './providers/suggestion.provider';
import { RecommendationWebView } from './providers/recommendation.provider';
import { activateAnalyzeCommand } from './commands/AnalyzeDocument';
import { Util } from './utils';
import { createUserSession } from './helpers/CreateSession';
import { AnalyzeDocumentOnSave } from './helpers/AnalyzeTextDocumentOnSave';

let sessionInterval: any | null = null;
export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug');
  const analyzeDocumentOnSave = analyzeDocumentOnSaveConfig();

  createUserSession(context);
  sessionInterval = setInterval(() => {
    createUserSession(context);
  }, 60_000);

  activateAnalyzeCommand(context, debug);

  if (analyzeDocumentOnSave && analyzeDocumentOnSave === true) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        if (Util.isValidDocument(document)) {
          AnalyzeDocumentOnSave(
            {
              document,
            },
            context
          );
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
