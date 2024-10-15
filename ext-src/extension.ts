import * as vscode from 'vscode';
import { AnalyzeDocumentOnSaveConfig } from './config';
import { RecommendationWebView } from './providers/recommendation.provider';
import {
  activateEndorseCommand,
  activateDetailSuggestionCommand,
  activateFixSuggestionCommand,
  activateDiscardCommand,
  activateAnalyzeCommand,
} from './commands';
import {
  handleAnalyzeExpiration,
  createOrUpdateUserSession,
  initState,
  AnalyzeDocumentOnSave,
  decorationType,
} from './helpers';
import Util from './utils';
import {
  bootstrapExtensionEventEmitter,
  disposeExtensionEventEmitter,
  getExtensionEventEmitter,
} from './events';
import { AnalysisData, Analyze, Recommendations } from './state';
import { Problem } from './types';
import { RecommendationTextProvider } from './providers/RecommendationTextProvider';
import CONSTANTS from './constants';
import { AnalyzedDocumentTextProvider } from './providers/PreviousProblemsTextProvider';

let expirationTimer: any = undefined;

export function activate(context: vscode.ExtensionContext): void {
  let prevTabInput: vscode.TabInputText | vscode.TabInputTextDiff | undefined = undefined;
  const _debug = vscode.window.createOutputChannel('Metabob');
  bootstrapExtensionEventEmitter();

  initState(context);

  if (!context.extension || !context.extensionUri) {
    vscode.window.showErrorMessage('Metabob: Extension Context is not available');

    return;
  }

  const analyzeDocumentOnSaveConfig = AnalyzeDocumentOnSaveConfig();

  try {
    // handle Analyze State Expiration
    handleAnalyzeExpiration(context);

    const one_minute = 60_000;
    const thirty_minutes = one_minute * 30;
    expirationTimer = setInterval(() => {
      handleAnalyzeExpiration(context);
    }, thirty_minutes);

    context.subscriptions.push(
      vscode.workspace.registerTextDocumentContentProvider(
        CONSTANTS.recommendationDocumentProviderScheme,
        new RecommendationTextProvider(context),
      ),
    );

    context.subscriptions.push(
      vscode.workspace.registerTextDocumentContentProvider(
        CONSTANTS.analyzedDocumentProviderScheme,
        new AnalyzedDocumentTextProvider(new Analyze(context)),
      ),
    );

    // Create User Session, If already created get the refresh token
    // otherwise, ping server every 60 second to not destroy the token
    // if the user has not done any activity
    createOrUpdateUserSession(context);

    // Analyze command that hit /analyze endpoint with current file content
    // then decorate current file with error
    activateAnalyzeCommand(context, _debug);

    // If the user Discard a suggestion, it would be removed from decoration
    // and the global state as well
    activateDiscardCommand(context);

    // If the user feels suggestion is good, he can endorse that suggestion
    // Used to notify the model about positive feedback
    activateEndorseCommand(context);

    // When the user click the detail button on the problem
    activateDetailSuggestionCommand(context);

    // Whenever the user clicks the fix button
    activateFixSuggestionCommand(context);

    // Setup opened file
    const tab = vscode.window.tabGroups.activeTabGroup.activeTab;
    if (tab && tab.input instanceof vscode.TabInputText && tab.input.uri.scheme === 'file') {
      // Valid document for analysis
      const activeEditor = vscode.window.activeTextEditor!;
      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.value();
      if (analyzeValue) {
        const results: Problem[] = Util.getCurrentEditorProblems(
          analyzeValue,
          activeEditor.document.fileName,
        );
        if (results) {
          Util.decorateCurrentEditorWithHighlights(results, activeEditor);
        }
      }
      prevTabInput = tab.input;
    }
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Metabob: Error activating extension: ${error.message}`);
    }
    _debug.appendLine(
      `Error activating extension: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`,
    );

    return;
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
      const savedDocumentMetaData = Util.extractMetaDataFromDocument(document);
      const currentWorkSpaceFolder = Util.getRootFolderName();
      if (!savedDocumentMetaData.fileName) return;

      const fileName: string = savedDocumentMetaData.fileName;

      // Will check if the current document is valid code file.
      if (!(analyzeDocumentOnSaveConfig && analyzeDocumentOnSaveConfig === true)) {
        return;
      }

      const documentMetaData = Util.getCurrentFile();

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
        data: document.uri.fsPath,
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_PROJECT',
        data: {
          name: currentWorkSpaceFolder,
        },
      });
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
      // Invalidate analysis if the document content has changed
      const analyzeState = new Analyze(context);
      analyzeState.update(state => {
        const analyses: AnalysisData[] | undefined = state[e.document.fileName];
        if (!analyses) return state;
        for (let i = 0; i < analyses.length; i++) {
          analyses[i].isValid = analyses[i].analyzedDocumentContent === e.document.getText();
        }

        return state;
      });

      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) return;
      Util.decorateCurrentEditorWithHighlights(
        Util.getCurrentEditorProblems(analyzeState.value(), activeEditor.document.fileName),
        activeEditor,
      );
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor | undefined) => {
      // onDidChangeActiveTextEditor fires twice when the user changes from one text file to another
      // The first sets the activeTextEditor to undefined and the second sets it to the new text editor
      const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;

      if (activeTab?.input === prevTabInput) {
        return;
      } else if (Util.isRecommendationDiffTab(activeTab?.input)) {
        prevTabInput = activeTab?.input;

        return;
      } else if (
        e &&
        activeTab?.input instanceof vscode.TabInputText &&
        activeTab.input.uri.scheme === CONSTANTS.analyzedDocumentProviderScheme
      ) {
        const results = Util.getPreviousEditorProblems(
          new Analyze(context).value(),
          e.document.uri.fsPath,
        );
        Util.decorateCurrentEditorWithHighlights(results, e);

        return;
      } else if (
        !activeTab ||
        !(activeTab.input instanceof vscode.TabInputText) ||
        activeTab.input.uri.scheme !== 'file'
      ) {
        extensionEventEmitter.fire({
          type: 'No_Editor_Detected',
          data: {},
        });
        prevTabInput = undefined;
      } else if (e) {
        if (Util.isRecommendationDiffTab(prevTabInput)) {
          // Close recommendation diff tab
          const allTabGroups = vscode.window.tabGroups.all;
          let prevTab: vscode.Tab | null = null;
          for (const grp of allTabGroups) {
            for (const tab of grp.tabs) {
              if (
                tab.input instanceof vscode.TabInputTextDiff &&
                tab.input.original.toString() === prevTabInput.original.toString() &&
                tab.input.modified.toString() === prevTabInput.modified.toString()
              ) {
                prevTab = tab;
                break;
              }
            }
            if (prevTab) {
              vscode.window.tabGroups.close(prevTab).then(undefined, e => {
                vscode.window.showErrorMessage(JSON.stringify(e));
              });
              break;
            }
          }

          // Clear recommendations state
          new Recommendations(context).clear();
        }

        const { filePath } = Util.extractMetaDataFromDocument(e.document);

        if (!filePath) {
          return;
        }

        if (filePath.includes('extension-output')) {
          return;
        }

        const currentWorkSpaceFolder = Util.getRootFolderName();

        const analyzeState = new Analyze(context);
        const analyzeValue = analyzeState.get().value;
        const results = Util.getCurrentEditorProblems(analyzeValue, filePath);

        if (results.length === 0) {
          extensionEventEmitter.fire({
            type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
            data: {
              hasOpenTextDocuments: true,
              hasWorkSpaceFolders: true,
            },
          });

          extensionEventEmitter.fire({
            type: 'CURRENT_FILE',
            data: e.document.uri.fsPath,
          });

          extensionEventEmitter.fire({
            type: 'CURRENT_PROJECT',
            data: {
              name: currentWorkSpaceFolder,
            },
          });

          extensionEventEmitter.fire({
            type: 'onDiscardSuggestionClicked:Success',
            data: {},
          });

          extensionEventEmitter.fire({
            type: 'Analysis_Completed',
            data: {
              shouldResetRecomendation: false,
              shouldMoveToAnalyzePage: false,
            },
          });

          prevTabInput = activeTab.input;

          return;
        }

        Util.decorateCurrentEditorWithHighlights(results, e);
        extensionEventEmitter.fire({
          type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
          data: {
            hasOpenTextDocuments: true,
            hasWorkSpaceFolders: true,
          },
        });

        extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: e.document.uri.fsPath,
        });

        extensionEventEmitter.fire({
          type: 'CURRENT_PROJECT',
          data: {
            name: currentWorkSpaceFolder,
          },
        });

        extensionEventEmitter.fire({
          type: 'onDiscardSuggestionClicked:Success',
          data: {},
        });

        extensionEventEmitter.fire({
          type: 'Analysis_Completed',
          data: {
            shouldResetRecomendation: false,
            shouldMoveToAnalyzePage: false,
          },
        });

        prevTabInput = activeTab.input;
      }
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
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
  );
}

export function deactivate(): void {
  decorationType.dispose();
  disposeExtensionEventEmitter();
  if (expirationTimer) {
    clearInterval(expirationTimer);
  }
}
