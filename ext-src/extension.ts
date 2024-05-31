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
import { Analyze } from './state';
import { Problem } from './types';
import { initializeFileWatcher } from './helpers/FileWatcher';

let expirationTimer: any = undefined;
let fileWatcher:vscode.FileSystemWatcher

export function activate(context: vscode.ExtensionContext): void {
  let previousEditor: vscode.TextEditor | undefined = undefined;
  const _debug =  vscode.window.createOutputChannel('Metabob');
  bootstrapExtensionEventEmitter();
  initState(context);

  console.log('Congratulations, your extension "metabob" is now active!');
  if (!context.extension || !context.extensionUri) {
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
    }, thirty_minutes)

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

    // Deprecated
    activateFocusRecommendCommand(context);

    // When the user click the detail button on the problem
    activateDetailSuggestionCommand(context);

    // Whenever the user clicks the fix button
    activateFixSuggestionCommand(context, _debug);
  } catch {
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

  const workspaceFolders = vscode.workspace.workspaceFolders; //retrievee workspace folders -> An array of information aboout the folders
    if (workspaceFolders) {
        const repoPath = workspaceFolders[0].uri.fsPath;

        // Initialize file watcher
        initializeFileWatcher(repoPath, context);
    }

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

      extensionEventEmitter.fire({
        type: 'CURRENT_PROJECT',
        data: {
          name: currentWorkSpaceFolder,
        },
      });
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(e => {
      const currentWorkSpaceFolder = Util.getRootFolderName();
      const { fileName } = Util.extractMetaDataFromDocument(e);
      if (!fileName) {

        return;
      }

      if (fileName.includes('extension-output')) {
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.document) {
        extensionEventEmitter.fire({
          type: 'No_Editor_Detected',
          data: {},
        });

        return;
      }

      if (editor.document.uri.fsPath !== e.uri.fsPath) {
        return;
      }

      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.get()?.value;
      if (!analyzeValue) return;

      const isValidEditor = Util.isValidDocument(editor.document);

      if (isValidEditor) {
        extensionEventEmitter.fire({
          type: 'Analysis_Completed',
          data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
        });
        extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: { ...editor.document },
        });
        extensionEventEmitter.fire({
          type: 'CURRENT_PROJECT',
          data: {
            name: currentWorkSpaceFolder,
          },
        });
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((e: vscode.TextDocument) => {
      const bufferedEParam: vscode.TextDocument = {
        ...e,
        fileName: e.fileName.replace('.git', ''),
      };
      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.get()?.value;
      if (!analyzeValue) {
        return;
      }

      const activeTextEditor = vscode.window.activeTextEditor;
      if (!activeTextEditor) {
        return;
      }

      if (activeTextEditor.document.fileName !== bufferedEParam.fileName) {
        return;
      }

      const currentWorkSpaceFolder = Util.getRootFolderName();
      const documentMetaData = Util.extractMetaDataFromDocument(bufferedEParam);
      let fileName: string | undefined = undefined;

      if (documentMetaData.fileName) {
        fileName = documentMetaData.fileName;
      }

      if (!fileName && documentMetaData.filePath) {
        const splitKey: string | undefined = documentMetaData.filePath
          .split('/')
          .pop()
          ?.replace('.git', '');
        if (splitKey) {
          fileName = splitKey;
        }
      }

      if (!fileName) {
        return;
      }

      const results: Problem[] | undefined = Util.getCurrentEditorProblems(analyzeValue, fileName);
      if (!results) {
        return;
      }

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
          data: { ...activeTextEditor.document },
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
          data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
        });

        return;
      }

      Util.decorateCurrentEditorWithHighlights(results, activeTextEditor);

      extensionEventEmitter.fire({
        type: 'CURRENT_FILE',
        data: { ...activeTextEditor.document },
      });

      extensionEventEmitter.fire({
        type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
        data: {
          hasOpenTextDocuments: true,
          hasWorkSpaceFolders: true,
        },
      });

      extensionEventEmitter.fire({
        type: 'onDiscardSuggestionClicked:Success',
        data: {},
      });

      extensionEventEmitter.fire({
        type: 'CURRENT_PROJECT',
        data: {
          name: currentWorkSpaceFolder,
        },
      });

      extensionEventEmitter.fire({
        type: 'Analysis_Completed',
        data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: true, ...analyzeValue },
      });
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor | undefined) => {
      if (!e) {
        return;
      }
      const { fileName } = Util.extractMetaDataFromDocument(e.document);

      if (!fileName) {
        return;
      }

      if (fileName.includes('extension-output')) {
        return;
      }

      const currentWorkSpaceFolder = Util.getRootFolderName();

      if (previousEditor) {
        previousEditor.setDecorations(decorationType, []);
      }

      const analyzeState = new Analyze(context);
      const analyzeValue = analyzeState.get()?.value;
      if (!analyzeValue) {
        return;
      }

      const results: Problem[] | undefined = Util.getCurrentEditorProblems(analyzeValue, fileName);
      if (!results) {
        return;
      }

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
          data: { ...e.document },
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
            ...analyzeValue,
          },
        });

        previousEditor = e;

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
        data: { ...e.document },
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
        data: { shouldResetRecomendation: false, shouldMoveToAnalyzePage: false, ...analyzeValue },
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
  decorationType.dispose();
  disposeExtensionEventEmitter();
  if (expirationTimer) {
    clearInterval(expirationTimer);
  }
}
