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
  decorationType,
} from './helpers';
import Util from './utils';
import debugChannel from './debug';
import {
  bootstrapExtensionEventEmitter,
  disposeExtensionEventEmitter,
  getExtensionEventEmitter,
} from './events';
import { Analyze } from './state';
import { Problem } from './types';

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
  // Analyze on Save functionality is only ran if the user enabled it.
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(document => {
      let savedDocumentMetaData = Util.extractMetaDataFromDocument(document);
      if (!savedDocumentMetaData.fileName) return;

      let fileName: string = savedDocumentMetaData.fileName;

      // Will check if the current document is valid code file.
      if (!(analyzeDocumentOnSaveConfig && analyzeDocumentOnSaveConfig === true)) {
        return;
      }

      const documentMetaData = Util.getFileNameFromCurrentEditor();

      if (!documentMetaData) {
        return;
      }

      if (fileName !== documentMetaData.fileName) {
        return;
      }

      documentMetaData.editor.setDecorations(decorationType, []);

      AnalyzeDocumentOnSave(
        {
          document,
        },
        context,
      );

      extensionEventEmitter.fire({
        type: 'Analysis_Called_On_Save',
        data: {},
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...document },
      });
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(() => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.document) {
        extensionEventEmitter.fire({
          type: 'No_Editor_Detected',
          data: {},
        });

        return;
      }

      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.get()?.value;
      if (!analyzeValue) return;

      const isValidEditor = Util.isValidDocument(editor.document);

      if (isValidEditor) {
        getExtensionEventEmitter().fire({
          type: 'Analysis_Completed',
          data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
        });
        extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: { ...editor.document },
        });
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((e: vscode.TextDocument) => {
      const documentMetaData = Util.extractMetaDataFromDocument(e);
      if (!documentMetaData.fileName) return

      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.get()?.value;
      if (!analyzeValue) return;

      const results: Problem[] | undefined = Util.getCurrentEditorProblems(
        analyzeValue,
        documentMetaData.fileName,
      );
      if (!results) return;

      if (results.length === 0) {
        extensionEventEmitter.fire({
          type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
          data: {
            hasOpenTextDocuments: true,
            hasWorkSpaceFolders: true,
          },
        });

        getExtensionEventEmitter().fire({
          type: 'Analysis_Completed',
          data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
        });

        extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: { ...e },
        });
        return;
      }

      const activeTextEditor = vscode.window.activeTextEditor;
      if (!activeTextEditor) return;
      if (activeTextEditor.document.fileName !== e.fileName) return;

      Util.decorateCurrentEditorWithHighlights(results, activeTextEditor);

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...e },
      });

      extensionEventEmitter.fire({
        type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
        data: {
          hasOpenTextDocuments: true,
          hasWorkSpaceFolders: true,
        },
      });

      getExtensionEventEmitter().fire({
        type: 'Analysis_Completed',
        data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
      });
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor | undefined) => {
      if (!e) return;
      const { fileName } = Util.extractMetaDataFromDocument(e.document);
      if (!fileName) return;

      if (previousEditor) {
        previousEditor.setDecorations(decorationType, []);
      }

      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.get()?.value;
      if (!analyzeValue) return;

      const results: Problem[] | undefined = Util.getCurrentEditorProblems(analyzeValue, fileName);
      if (!results) return;

      if (results.length === 0) {
        extensionEventEmitter.fire({
          type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
          data: {
            hasOpenTextDocuments: true,
            hasWorkSpaceFolders: true,
          },
        });
        getExtensionEventEmitter().fire({
          type: 'Analysis_Completed',
          data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
        });

        extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: { ...e.document },
        });
        return;
      }

      const isApplied = Util.decorateCurrentEditorWithHighlights(results, e);
      debugChannel.appendLine('onDidChangeActiveTextEditor: ' + isApplied);

      extensionEventEmitter.fire({
        type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
        data: {
          hasOpenTextDocuments: true,
          hasWorkSpaceFolders: true,
        },
      });

      getExtensionEventEmitter().fire({
        type: 'Analysis_Completed',
        data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...e.document },
      });

      previousEditor = e;
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
