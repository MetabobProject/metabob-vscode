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
  Range,
  commands,
  env,
  workspace,
  ViewColumn,
} from 'vscode';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import { explainService, ExplainProblemPayload, SuggestRecomendationPayload } from '../services';
import { CurrentQuestion, CurrentQuestionState, Session, Analyze, AnalyseMetaData } from '../state';
import { BackendService, GetChatGPTToken } from '../config';
import { DiscardCommandHandler, EndorseCommandHandler } from '../commands';
import CONSTANTS from '../constants';
import Util from '../utils';
import debugChannel from '../debug';
import { AnalysisEvents } from '../events';
import { Problem } from '../types';

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
  }

  sendDefaultEvents() {
    const getanalyzeState = new Analyze(this.extensionContext).get()?.value;
    if (!getanalyzeState) return;
    const editor = window.activeTextEditor;
    if (!editor) return;
    const currentWorkSpaceFolder = Util.getWorkspacePath();

    if (this._view?.visible === true) {
      setTimeout(() => {
        this.extensionEventEmitter.fire({
          type: 'Analysis_Completed',
          data: {
            shouldResetRecomendation: true,
            shouldMoveToAnalyzePage: true,
            ...getanalyzeState,
          },
        });

        this.extensionEventEmitter.fire({
          type: 'CURRENT_FILE',
          data: { ...editor.document },
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
      }, 500);
    }
  }

  intervalHandler() {
    if (this?._view === null || this?._view === undefined || !this?._view.webview) {
      return;
    }

    if (!this._view.visible) {
      return;
    }

    for (let i = 0; i < this.eventEmitterQueue.length; i++) {
      const event = this.eventEmitterQueue[i];
      debugChannel.appendLine(
        'Metabob webview is visible now. Sending events: ' + this.eventEmitterQueue.length,
      );

      if (event) {
        this?._view?.webview?.postMessage(event);
      }
    }

    this.eventEmitterQueue = [];
  }

  activateExtensionEventListener(): void {
    const self = this;
    this.extensionEventEmitter.event(event => {
      if (this?._view === null || this?._view === undefined || !this?._view.webview) {
        debugChannel.appendLine(
          `Metabob: this.view.webview is undefined and got event ${JSON.stringify(event)}`,
        );

        return;
      }

      if (this._view.visible === false) {
        debugChannel.appendLine('Metabob webview is not visible. Starting event queue.');
        this.eventEmitterQueue.push(event);
        if (!this.interval) {
          this.interval = setInterval(this.intervalHandler.bind(self), 300);
        }
        return;
      }

      this.eventEmitterQueue = [];
      clearInterval(this.interval);
      this._view.webview.postMessage(event);
    });
  }

  async updateCurrentQuestionState(payload: CurrentQuestionState): Promise<void> {
    const currentQuestionState = new CurrentQuestion(this.extensionContext);

    await currentQuestionState.update(() => payload);

    return;
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

      if (!isChatConfigEnabled) {
        this._view?.webview.postMessage({
          type: 'onGenerateClicked:Response',
          data: {
            recommendation: response.value.recommendation,
          },
        });

        return;
      }

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
        type: 'onGenerateClickedGPT:Response',
        data: { ...chatresponse.data },
      });
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

    if (
      this._view === null ||
      this._view === undefined ||
      this._view.webview === undefined ||
      !currentEditor ||
      this._view.visible === false
    ) {
      return;
    }

    const initPayload: {
      initData?: any;
      hasOpenTextDocuments?: boolean;
      hasWorkSpaceFolders?: boolean;
    } = {};

    if (getanalyzeState) {
      initPayload.initData = { ...getanalyzeState };
    }

    initPayload.hasOpenTextDocuments = Util.hasOpenTextDocuments();
    initPayload.hasWorkSpaceFolders = Util.hasWorkspaceFolder();

    this.extensionEventEmitter.fire({
      type: 'INIT_DATA_UPON_NEW_FILE_OPEN',
      data: {
        hasOpenTextDocuments: true,
        hasWorkSpaceFolders: true,
      },
    });

    this.extensionEventEmitter.fire({
      type: 'Analysis_Completed',
      data: { shouldResetRecomendation: false, shouldMoveToAnalyzePage: false, ...getanalyzeState },
    });

    this.extensionEventEmitter.fire({
      type: 'CURRENT_FILE',
      data: { ...currentEditor.document },
    });

    this._view.webview
      .postMessage({
        type: 'initData',
        data: { ...initPayload },
      })
      .then(undefined, err => {
        window.showErrorMessage(err);
      });
  }

  async handleApplyRecommendation(input: string, initData: CurrentQuestionState) {
    const documentMetadata = Util.getFileNameFromCurrentEditor();
    if (!documentMetadata || !initData) {
      throw new Error('handleApplyRecommendation: Editor or Init Data is undefined');
    }

    const key = `${initData.path}@@${initData.id}`;
    if (documentMetadata.fileName !== initData.path) {
      throw new Error('handleApplyRecommendation: User editor changed');
    }

    const setAnalyzeState = new Analyze(this.extensionContext);
    const getanalyzeState = new Analyze(this.extensionContext).get()?.value;
    if (!getanalyzeState) {
      throw new Error('handleApplyRecommendation: Analze is undefined');
    }

    const copyAnalyzeValue = { ...getanalyzeState };
    copyAnalyzeValue[key].isDiscarded = true;
    copyAnalyzeValue[key].isEndorsed = false;
    copyAnalyzeValue[key].isViewed = true;

    const results: Problem[] | undefined = Util.getCurrentEditorProblems(
      copyAnalyzeValue,
      initData.path,
    );
    if (!results) {
      throw new Error('handleApplyRecommendation: Results are undefined');
    }

    const isCurrentFileDecorated = Util.decorateCurrentEditorWithHighlights(
      results,
      documentMetadata.editor,
    );

    if (!isCurrentFileDecorated) {
      throw new Error('handleApplyRecommendation: could not decorate current file');
    }

    // Immediately replace suggested recommendation in the editor
    const startLine = initData.vuln.startLine;
    const endLine = initData.vuln.endLine;
    const comment = `${input.replace('```', '')}`;
    const start = new Position(startLine - 1, 0); // convert line number to position
    const end = new Position(endLine, 0); // convert line number to position
    const range = new Range(start, end);
    documentMetadata.editor.edit((editBuilder: TextEditorEdit) => {
      editBuilder.replace(range, comment + '\n');
    });
    await setAnalyzeState.set({ ...copyAnalyzeValue });
  }

  async openExternalLink(url: string): Promise<void> {
    await env.openExternal(Uri.parse(url));

    return;
  }

  searchFileByName(fileName: string) {
    const searchPattern = `**/${fileName}`;
    return workspace.findFiles(searchPattern, '**/node_modules/**', 1);
  }

  async openFileInNewTab(fileName: string) {
    const searchedFilePath = await this.searchFileByName(fileName);
    const path: Uri | undefined = searchedFilePath[0];

    if (!path) return;
    // Use the `openTextDocument` method to open the document
    workspace.openTextDocument(Uri.file(path.fsPath)).then(document => {
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
        case 'OPEN_FILE_IN_NEW_TAB':
          const { name: fileName } = data;
          this.openFileInNewTab(fileName);
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
        case 'applyRecommendation': {
          const input = data?.input;
          const initData = data?.initData;
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null');
            this._view.webview.postMessage({
              type: 'applyRecommendation:Error',
              data: {},
            });
            break;
          }
          try {
            this.handleApplyRecommendation(input, initData);
          } catch (error: any) {
            window.showErrorMessage(`${CONSTANTS.applyRecommendationEror}`);
            this._view.webview.postMessage({
              type: 'applyRecommendation:Error',
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
            commands.executeCommand('metabob.discardSuggestion', payload);
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
