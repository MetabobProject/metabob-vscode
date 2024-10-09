import * as path from 'path';

import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window,
  ExtensionContext,
  TextEditorEdit,
  Position,
  commands,
  env,
  workspace,
  ViewColumn,
} from 'vscode';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import { explainService, ExplainProblemPayload, SuggestRecomendationPayload } from '../services';
import { CurrentQuestion, CurrentQuestionState, Session, Analyze } from '../state';
import { BackendService, GetChatGPTToken } from '../config';
import { DiscardCommandHandler, EndorseCommandHandler } from '../commands';
import CONSTANTS from '../constants';
import Util from '../utils';
import { AnalysisEvents } from '../events';

export class RecommendationWebView implements WebviewViewProvider {
  private _view?: WebviewView | null = null;
  private readonly extensionPath: string;
  private readonly extensionURI: Uri;
  private readonly extensionContext: ExtensionContext;
  private extensionEventEmitter: EventEmitter<AnalysisEvents>;
  private eventEmitterQueue: Array<AnalysisEvents> = [];
  private interval: NodeJS.Timeout | undefined = undefined;

  constructor(
    extensionPath: string,
    extensionURI: Uri,
    context: ExtensionContext,
    extensionEventEmitter: EventEmitter<AnalysisEvents>,
  ) {
    this.extensionPath = extensionPath;
    this.extensionURI = extensionURI;
    this.extensionContext = context;
    this.extensionEventEmitter = extensionEventEmitter;
  }

  getCurrentQuestionValue(): CurrentQuestionState | undefined {
    const currentQuestion = new CurrentQuestion(this.extensionContext).get()?.value;

    if (!currentQuestion) return undefined;

    return currentQuestion;
  }

  clear(): void {
    const currentQuestion = new CurrentQuestion(this.extensionContext);
    currentQuestion.clear();
  }

  refresh(): void {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
    }
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [Uri.file(path.join(this.extensionPath, 'build'))],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    this._view = webviewView;
    this.activateWebviewMessageListener();
    this.activateExtensionEventListener();
    this.sendDefaultEvents();
    this._view.onDidChangeVisibility(
      () => {
        if (this._view?.visible === false) {
          this._view.webview.postMessage({
            type: 'VISIBILITY_LOST',
            data: {},
          });
        }
      },
      null,
      this.extensionContext.subscriptions,
    );
  }

  sendDefaultEvents() {
    const getanalyzeState = new Analyze(this.extensionContext).get()?.value;
    if (!getanalyzeState) return;
    const editor = window.activeTextEditor;
    if (!editor) return;
    const currentWorkSpaceFolder = Util.getRootFolderName();

    if (this._view?.visible === true) {
      setTimeout(() => {
        this.extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: editor.document.uri.fsPath,
        });

        this.extensionEventEmitter.fire({
          type: 'CURRENT_PROJECT',
          data: {
            name: currentWorkSpaceFolder,
          },
        });

        this.extensionEventEmitter.fire({
          type: 'onDiscardSuggestionClicked:Success',
          data: {},
        });

        this.extensionEventEmitter.fire({
          type: 'Analysis_Completed',
          data: {
            shouldResetRecomendation: true,
            shouldMoveToAnalyzePage: true,
          },
        });
      }, 500);
    }
  }

  activateExtensionEventListener(): void {
    this.extensionEventEmitter.event(event => {
      if (this?._view === null || this?._view === undefined || !this?._view.webview) {
        return;
      }

      this?._view?.webview?.postMessage(event);
    });
  }

  async updateCurrentQuestionState(payload: CurrentQuestionState): Promise<void> {
    const currentQuestionState = new CurrentQuestion(this.extensionContext);

    await currentQuestionState.update(() => payload);

    return;
  }

  async handleShowPreviousResults(path: string): Promise<void> {
    const d = await workspace.openTextDocument(
      Uri.from({
        scheme: CONSTANTS.analyzedDocumentProviderScheme,
        path,
      }),
    );
    await window.showTextDocument(d);
  }

  async handleSuggestionClick(input: string, initData: CurrentQuestionState): Promise<void> {
    if (this._view === null || this._view === undefined || !this._view?.webview) {
      throw new Error('handleSuggestionClick: Webview is undefined');
    }

    if (!initData) {
      throw new Error('handleSuggestionClick: Init Data is undefined');
    }
    const backendServiceConfig = BackendService();
    const chatGPTToken = GetChatGPTToken();
    const isChatConfigEnabled = backendServiceConfig === 'openai/chatgpt';

    // If chatGpt is enabled and token is '' or undefined throw error early
    if (isChatConfigEnabled === true && (chatGPTToken === '' || !chatGPTToken)) {
      window.showErrorMessage(
        'Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected',
      );
      throw new Error('handleSuggestionClick: ChatGPTToken is Required when gpt-config is enabled');
    }

    const sessionToken = new Session(this.extensionContext).get()?.value;

    // If Session Token is undefined, throw error early
    if (!sessionToken) {
      throw new Error('handleSuggestionClick: Session Token is Undefined');
    }

    const explainProblemPayload: ExplainProblemPayload = {
      problemId: initData.id,
      prompt: input,
      description: initData.vuln.description,
    };

    try {
      const response = await explainService.explainProblem(
        explainProblemPayload,
        sessionToken,
        isChatConfigEnabled,
      );
      if (response.isErr()) {
        window.showErrorMessage(
          `Metabob: ${response.error.errorMessage} ${response.error.responseStatus}`,
        );
        throw new Error('Something went wrong with the request! Please try again.');
      }

      if (response.value === null) {
        throw new Error('handleSuggestionClick: Response value is null');
      }

      if (!isChatConfigEnabled) {
        const payload = response.value;
        this._view?.webview.postMessage({
          type: 'onSuggestionClicked:Response',
          data: payload,
        });

        return;
      }

      // ChatGPT is enabled and Response is good
      const configuration = new Configuration({
        apiKey: chatGPTToken,
      });
      const openai = new OpenAIApi(configuration);
      const payload: CreateChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: response.value.prompt,
          },
          {
            role: 'user',
            content: input,
          },
        ],
      };
      const chatresponse = await openai.createChatCompletion({ ...payload });
      this._view.webview.postMessage({
        type: 'onSuggestionClickedGPT:Response',
        data: { ...chatresponse.data },
      });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async handleRecommendationClick(input: string, initData: CurrentQuestionState): Promise<void> {
    if (this._view === null || this._view === undefined || !this._view.webview) {
      throw new Error('handleRecommendationClick: Webview is undefined');
    }

    if (!initData) {
      throw new Error('handleRecommendationClick: InitData is undefined or null');
    }

    const backendServiceConfig = BackendService();
    const chatGPTToken = GetChatGPTToken();
    const isChatConfigEnabled = backendServiceConfig === 'openai/chatgpt';

    if (isChatConfigEnabled === true && (chatGPTToken === '' || !chatGPTToken)) {
      window.showErrorMessage(
        'Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected',
      );
      throw new Error(
        'Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected',
      );
    }

    const sessionToken = new Session(this.extensionContext).get()?.value;
    if (!sessionToken) {
      throw new Error('handleRecommendationClick: Session Token is undefined');
    }

    const suggestRecomendationPayload: SuggestRecomendationPayload = {
      problemId: initData.id,
      prompt: input,
      description: initData.vuln.description,
      context: '',
      recommendation: '',
    };

    try {
      const response = await explainService.RecommendSuggestion(
        suggestRecomendationPayload,
        sessionToken,
        isChatConfigEnabled,
      );

      if (response.isErr()) {
        window.showErrorMessage(CONSTANTS.generateConnectionError);
        throw new Error('Something went wrong! Please try again');
      }

      if (response.value === null) {
        window.showErrorMessage(CONSTANTS.generateConnectionError);
        throw new Error('handleRecommendationClick: Response value is null');
      }

      let recommendation: string;

      if (!isChatConfigEnabled) {
        recommendation = response.value.recommendation;
        this._view?.webview.postMessage({
          type: 'onGenerateClicked:Response',
          data: {
            problemId: initData.id,
            recommendation: recommendation,
          },
        });
      } else {
        const configuration = new Configuration({
          apiKey: chatGPTToken,
        });
        const openai = new OpenAIApi(configuration);
        const payload: CreateChatCompletionRequest = {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: response.value.prompt,
            },
            {
              role: 'user',
              content: input,
            },
          ],
        };
        const chatresponse = await openai.createChatCompletion({ ...payload });
        recommendation = chatresponse.data.choices[0].message?.content || '';
        this._view.webview.postMessage({
          type: 'onGenerateClickedGPT:Response',
          data: {
            recommendation: recommendation,
            problemId: initData.id,
          },
        });
      }

      commands.executeCommand(
        'vscode.diff',
        Uri.from({
          scheme: CONSTANTS.recommendationDocumentProviderScheme,
          path: window.activeTextEditor?.document.uri.path,
          query: JSON.stringify({
            recommendation: recommendation,
            startLine: initData.vuln.startLine,
            endLine: initData.vuln.endLine,
          }),
        }),
        Uri.file(window.activeTextEditor?.document.uri.path ?? ''),
      );
    } catch (error: any) {
      throw new Error(error);
    }
  }

  handleApplySuggestion(input: string, initData: CurrentQuestionState): void {
    const editor = window.activeTextEditor;
    if (!editor || !initData) {
      throw new Error('handleApplySuggestion: Editor or InitData is Undefined');
    }

    const startLine = initData.vuln.startLine;
    const comment = `\t\t#${input}`;
    const position = new Position(startLine - 1, 0); // convert line number to position
    editor.edit((editBuilder: TextEditorEdit) => {
      editBuilder.replace(position, comment + '\n');
    });
  }

  postInitData(): void {
    const getanalyzeState = new Analyze(this.extensionContext).get()?.value;
    const currentEditor = window.activeTextEditor;
    const currentWorkSpaceFolder = Util.getRootFolderName();

    if (
      this._view === null ||
      this._view === undefined ||
      this._view.webview === undefined ||
      currentEditor === undefined ||
      currentWorkSpaceFolder === undefined
    ) {
      return;
    }

    const initPayload: {
      initData?: any;
      hasOpenTextDocuments?: boolean;
      hasWorkSpaceFolders?: boolean;
      currentWorkSpaceFolder?: string;
      currentFile?: any;
    } = {};

    if (getanalyzeState) {
      initPayload.initData = { ...getanalyzeState };
    }

    if (currentWorkSpaceFolder) {
      initPayload.currentWorkSpaceFolder = currentWorkSpaceFolder;
    }

    if (currentEditor) {
      initPayload.currentFile = { ...currentEditor.document };
    }

    initPayload.hasOpenTextDocuments = Util.hasOpenTextDocuments();
    initPayload.hasWorkSpaceFolders = Util.hasWorkspaceFolder();
    this._view.webview.postMessage({
      type: 'initData',
      data: { ...initPayload },
    });

    this._view.webview.postMessage({
      type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
      data: {
        hasOpenTextDocuments: true,
        hasWorkSpaceFolders: true,
      },
    });

    this._view.webview.postMessage({
      type: 'CURRENT_PROJECT',
      data: {
        name: currentWorkSpaceFolder,
      },
    });

    this._view.webview.postMessage({
      type: 'CURRENT_FILE',
      data: currentEditor.document.uri.fsPath,
    });

    this._view.webview.postMessage({
      type: 'Analysis_Completed',
      data: { shouldResetRecomendation: true, shouldMoveToAnalyzePage: false },
    });
  }

  async openExternalLink(url: string): Promise<void> {
    await env.openExternal(Uri.parse(url));

    return;
  }

  searchFileByName(fileName: string) {
    const searchPattern = `**/${fileName}`;

    return workspace.findFiles(searchPattern, '**/node_modules/**', 1);
  }

  async openFileInNewTab(filePath: string): Promise<void> {
    if (!filePath) return;

    // Use the `openTextDocument` method to open the document
    workspace.openTextDocument(Uri.file(filePath)).then(document => {
      // Use the `showTextDocument` method to show the document in a new tab
      window.showTextDocument(document, {
        viewColumn: ViewColumn.One,
        preserveFocus: true,
      });
    });
  }

  private activateWebviewMessageListener() {
    if (this._view === null || this._view === undefined || this._view.webview === undefined) {
      return;
    }

    const { postMessage } = this._view.webview;

    this._view.webview.onDidReceiveMessage(async (message: any) => {
      if (this._view === null || this._view === undefined || this._view.webview === undefined) {
        return;
      }
      const data = message.data;
      switch (message.type) {
        case 'view_previous_results':
          const { path } = data;
          if (!path) {
            window.showErrorMessage('Metabob: Cannot show previous results for undefined file');
          } else {
            await this.handleShowPreviousResults(path);
          }
          break;
        case 'OPEN_FILE_IN_NEW_TAB':
          const { path: filePath } = data;
          this.openFileInNewTab(filePath);
          break;
        case 'analysis_current_file':
          this.clear();
          commands.executeCommand('metabob.analyzeDocument');
          break;
        case 'open_external_link':
          const { url } = data;
          if (!url) {
            window.showErrorMessage('Metabob: URL to open is undefined');
          }
          this.openExternalLink(url);
          break;
        case 'onSuggestionClicked': {
          const input = data?.input;
          const initData = data?.initData;
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null');

            postMessage({
              type: 'onSuggestionClicked:Error',
              data: {},
            });
            break;
          }
          try {
            await this.handleSuggestionClick(input, initData);
            window.showInformationMessage(message.data);
          } catch {
            postMessage({
              type: 'onSuggestionClicked:Error',
              data: {},
            });
          }
          break;
        }
        case 'getInitData': {
          this.postInitData();
          break;
        }
        case 'initData:FixRecieved': {
          const initData = data?.initData;
          await this.updateCurrentQuestionState({ ...initData, isFix: false });
          break;
        }
        case 'initData:ResetRecieved': {
          const initData = data?.initData;
          await this.updateCurrentQuestionState({ ...initData, isReset: false });
          break;
        }
        case 'onGenerateClicked': {
          const input = data?.input;
          const initData = data?.initData;
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null');
            this._view.webview.postMessage({
              type: 'onGenerateClicked:Error',
              data: `Metabob: onGenerateClicked input in undefined ${JSON.stringify(data)}`,
            });
          }

          try {
            await this.handleRecommendationClick(input, initData);
            window.showInformationMessage(message.data);
          } catch (error: any) {
            this._view.webview.postMessage({
              type: 'onGenerateClicked:Error',
              data: JSON.stringify(error),
            });
          }
          break;
        }
        case 'applySuggestion': {
          const input = data?.input;
          const initData = data?.initData;
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null');
            this._view.webview.postMessage({
              type: 'applySuggestion:Error',
              data: {},
            });
            break;
          }
          try {
            this.handleApplySuggestion(input, initData);
          } catch (error) {
            this._view.webview.postMessage({
              type: 'applySuggestion:Error',
              data: {},
            });
          }

          break;
        }
        case 'onEndorseSuggestionClicked': {
          const initData = data?.initData;
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null');
            this._view.webview.postMessage({
              type: 'onEndorseSuggestionClicked:Error',
              data: {},
            });
            break;
          }

          const payload: EndorseCommandHandler = {
            id: initData.id,
            path: initData.path,
          };

          try {
            commands.executeCommand('metabob.endorseSuggestion', payload);
            this._view.webview.postMessage({
              type: 'onEndorseSuggestionClicked:Success',
              data: {},
            });
          } catch {
            this._view.webview.postMessage({
              type: 'onEndorseSuggestionClicked:Error',
              data: {},
            });
          }
          break;
        }
        case 'onDiscardSuggestionClicked': {
          const initData = data?.initData;
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null');
            this._view.webview.postMessage({
              type: 'onDiscardSuggestionClicked:Error',
              data: {},
            });
            break;
          }
          const payload: DiscardCommandHandler = {
            id: initData.id,
            path: initData.path,
          };
          try {
            commands.executeCommand(CONSTANTS.discardSuggestionCommand, payload);

            // this._view.webview.postMessage({
            //   type: 'onDiscardSuggestionClicked:Success',
            //   data: {},
            // });
          } catch {
            this._view.webview.postMessage({
              type: 'onDiscardSuggestionClicked:Error',
              data: {},
            });
          }
          break;
        }
        default:
          console.log(message);
      }
    });
  }

  private _getHtmlForWebview(webview: Webview) {
    // https://stackoverflow.com/questions/34828722/how-can-i-make-webpack-skip-a-require
    // @ts-ignore
    const manifest = __non_webpack_require__(
      path.join(this.extensionPath, 'build', 'asset-manifest.json'),
    );
    const mainScript = manifest['files']['main.js'];
    const mainStyle = manifest['files']['main.css'];

    const scriptUri = webview.asWebviewUri(Uri.joinPath(this.extensionURI, 'build', mainScript));
    const styleUri = webview.asWebviewUri(Uri.joinPath(this.extensionURI, 'build', mainStyle));

    // Use a nonce to whitelist which scripts can be run
    const nonce = Util.getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1, width=device-width" />
				<meta name="theme-color" content="#000000">
				<link rel="stylesheet" type="text/css" href="${styleUri}">
        <meta http-equiv="Content-Security-Policy"
              content="default-src 'none';
              img-src vscode-resource: https:;
              script-src 'nonce-${nonce}';
              style-src vscode-resource: 'unsafe-inline' http: https: data:
        ;">
				<base href="${Uri.file(path.join(this.extensionPath, 'build')).with({
          scheme: 'vscode-resource',
        })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>

        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
        </script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
