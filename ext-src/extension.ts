import * as vscode from 'vscode';
import { AnalyzeDocumentOnSaveConfig } from './config';
import { RecommendationWebView } from './providers/recommendation.provider';
import {
  activateEndorseCommand,
  activateFocusRecommendCommand,
  activateDetailSuggestionCommand,
  activateFixSuggestionCommand,
  activateDiscardCommand,
  activateAnalyzeCommand,
} from './commands';
import {
  createOrUpdateUserSession,
  initState,
  AnalyzeDocumentOnSave,
  GenerateDecorations,
  decorationType,
} from './helpers';
import Util from './utils';
import debugChannel from './debug';
import {
  bootstrapExtensionEventEmitter,
  disposeExtensionEventEmitter,
  getExtensionEventEmitter,
} from './events';
import { AnalyseMetaData, Analyze, AnalyzeState } from './state';

let previousEditor: vscode.TextEditor | undefined = undefined;

export function activate(context: vscode.ExtensionContext): void {
  bootstrapExtensionEventEmitter();
  debugChannel.show(true);
  debugChannel.appendLine('Activating Metabob Extension...');

  initState(context);

  if (!context.extension || !context.extensionUri) {
    debugChannel.appendLine(
      'Error Activating Metabob Extension\nReason: context.extension or context.extensionUri is undefined',
    );

    return;
  }

  const analyzeDocumentOnSaveConfig = AnalyzeDocumentOnSaveConfig();

  try {
    // Create User Session, If already created get the refresh token
    // otherwise, ping server every 60 second to not destroy the token
    // if the user has not done any activity
    createOrUpdateUserSession(context);

    // Analyze command that hit /analyze endpoint with current file content
    // then decorate current file with error
    activateAnalyzeCommand(context);

    // If the user Discard a suggestion, it would be removed from decoration
    // and the global state as well
    activateDiscardCommand(context);

    // If the user feels suggestion is good, he can endorse that suggestion
    // Used to notify the model about positive feedback
    activateEndorseCommand(context);

    // Deprecated
    activateFocusRecommendCommand(context);

    // When the user click the detail button on the problem
    activateDetailSuggestionCommand(context);

    // Whenever the user clicks the fix button
    activateFixSuggestionCommand(context);
  } catch (error: any) {
    debugChannel.appendLine(`Metabob: ${error}`);
  }

  // Analyze on Save functionality is only ran if the user enabled it.
  if (analyzeDocumentOnSaveConfig && analyzeDocumentOnSaveConfig === true) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        // Will check if the current document is valid code file.
        if (Util.isValidDocument(document)) {
          AnalyzeDocumentOnSave(
            {
              document,
            },
            context,
          );
        }
      }),
    );
  }

  // If the user changes the global config from CMD + Shift + P -> User Setting -> Metabob
  // Then, we would update global state or reload the application
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('metabob.apiKey') === true) {
        vscode.window.showInformationMessage('Metabob: API Key Changed');

        return;
      }
      if (e.affectsConfiguration('metabob.baseURl') === true) {
        vscode.window.showInformationMessage('Metabob: Base URL Changed');

        return;
      }
      if (e.affectsConfiguration('metabob.chatgptToken') === true) {
        vscode.window.showInformationMessage('Metabob: ChatGPT API Changed');

        return;
      }
      if (e.affectsConfiguration('metabob.backendSelection') === true) {
        const reloadWindowItem = { title: 'Reload Window' };
        vscode.window
          .showInformationMessage('Reload the window to apply changes?', reloadWindowItem)
          .then(selection => {
            if (selection === reloadWindowItem) {
              vscode.commands.executeCommand('workbench.action.reloadWindow');

              return;
            }

            return;
          });
      }
      if (e.affectsConfiguration('metabob.analyzeDocumentOnSave') === true) {
        const reloadWindowItem = { title: 'Reload Window' };
        vscode.window
          .showInformationMessage('Reload the window to apply changes?', reloadWindowItem)
          .then(selection => {
            if (selection === reloadWindowItem) {
              vscode.commands.executeCommand('workbench.action.reloadWindow');

              return;
            }

            return;
          });
      }
    }),
  );

  const extensionEventEmitter = getExtensionEventEmitter();

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(currentEditor => {
      if (!currentEditor) return;

      if (!Util.isValidDocument(currentEditor.document)) {
        return;
      }

      const documentMetaData = Util.extractMetaDataFromDocument(currentEditor.document);

      const filename: string | undefined = documentMetaData.relativePath.split('/').pop();

      if (!filename) return;

      const analyzeState = new Analyze(context);

      const analyzeValue = analyzeState.get()?.value;

      if (!analyzeValue) return;

      if (previousEditor) {
        previousEditor.setDecorations(decorationType, []);
      }

      const results: AnalyseMetaData[] = [];
      const analzeResultsOfCurrentFile: AnalyzeState = {};

      for (const [key, value] of Object.entries(analyzeValue)) {
        const splitString: string | undefined = key.split('@@')[0];
        if (splitString === undefined) continue;

        if (splitString === filename && value.isDiscarded === false) {
          results.push(value);

          analzeResultsOfCurrentFile[key] = value;
        }
      }

      if (results.length === 0) {
        extensionEventEmitter.fire({
          type: 'Analysis_Completed',
          data: analzeResultsOfCurrentFile,
        });

        return;
      }

      const { decorations } = GenerateDecorations(results, currentEditor);

      currentEditor.setDecorations(decorationType, []);
      currentEditor.setDecorations(decorationType, decorations);
      extensionEventEmitter.fire({
        type: 'Analysis_Completed',
        data: { ...analzeResultsOfCurrentFile },
      });

      previousEditor = currentEditor;
    }),
  );

  // Recommendation Panel Webview Provider that is the normal Metabob workflow
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'recommendation-panel-webview',
      new RecommendationWebView(
        context.extensionPath,
        context.extensionUri,
        context,
        extensionEventEmitter,
      ),
    ),
  );
}

export function deactivate(): void {
  debugChannel.dispose();
  decorationType.dispose();
  disposeExtensionEventEmitter();
  previousEditor = undefined;
}
