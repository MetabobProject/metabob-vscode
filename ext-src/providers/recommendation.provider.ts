import * as path from 'path'

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
  commands
} from 'vscode'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'
import { explainService, ExplainProblemPayload, SuggestRecomendationPayload } from '../services'
import { CurrentQuestion, CurrentQuestionState, SessionState, Session } from '../state'
import { BackendService, GetChatGPTToken } from '../config'
import { GenerateDecorations } from '../helpers'
import CONSTANTS from '../constants'
import Util from '../utils'
import { DiscardCommandHandler, EndorseCommandHandler } from '../commands'

export class RecommendationWebView implements WebviewViewProvider {
  private _view?: WebviewView | null = null
  private readonly extensionPath: string
  private readonly extensionURI: Uri
  private readonly extensionContext: ExtensionContext

  constructor(extensionPath: string, extensionURI: Uri, context: ExtensionContext) {
    this.extensionPath = extensionPath
    this.extensionURI = extensionURI
    this.extensionContext = context
    this.extensionContext.globalState.update(CONSTANTS.webview, this)
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<
    any | undefined | null | void
  >()

  getCurrentQuestionValue(): CurrentQuestionState | undefined {
    const currentQuestion = new CurrentQuestion(this.extensionContext).get()?.value

    if (!currentQuestion) return undefined
    return currentQuestion
  }

  clear(): void {
    const currentQuestion = new CurrentQuestion(this.extensionContext)
    currentQuestion.clear()
  }

  async updateCurrentQuestionState(payload: CurrentQuestionState): Promise<void> {
    const currentQuestionState = new CurrentQuestion(this.extensionContext)

    await currentQuestionState.update(() => payload)
    return
  }

  refresh(): void {
    this.onDidChangeTreeData.fire(null)
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view?.webview)
    }
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [Uri.file(path.join(this.extensionPath, 'build'))]
    }
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
    this._view = webviewView
    this.activateMessageListener()
  }

  async handleSuggestionClick(input: string, initData: CurrentQuestionState): Promise<void> {
    if (this._view === null || this._view === undefined || !this._view?.webview) {
      throw new Error('handleSuggestionClick: Webview is undefined')
    }

    if (!initData) {
      throw new Error('handleSuggestionClick: Init Data is undefined')
    }
    const backendServiceConfig = BackendService()
    const chatGPTToken = GetChatGPTToken()
    const isChatConfigEnabled = backendServiceConfig === 'openai/chatgpt'

    // If chatGpt is enabled and token is '' or undefined throw error early
    if (isChatConfigEnabled === true && (chatGPTToken === '' || !chatGPTToken)) {
      window.showErrorMessage('Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected')
      throw new Error('handleSuggestionClick: ChatGPTToken is Required when gpt-config is enabled')
    }

    const sessionToken = new Session(this.extensionContext).get()?.value
    // If Session Token is undefined, throw error early
    if (!sessionToken) {
      throw new Error('handleSuggestionClick: Session Token is Undefined')
    }

    const explainProblemPayload: ExplainProblemPayload = {
      problemId: initData.id,
      prompt: input,
      description: initData.vuln.description
    }

    try {
      const response = await explainService.explainProblem(explainProblemPayload, sessionToken, isChatConfigEnabled)
      if (response.isErr()) {
        window.showErrorMessage(`Metabob: ${response.error.errorMessage} ${response.error.responseStatus}`)
        throw new Error('Something went wrong with the request! Please try again.')
      }

      if (response.value === null) {
        throw new Error('handleSuggestionClick: Response value is null')
      }

      if (!isChatConfigEnabled) {
        const payload = response.value
        this._view?.webview.postMessage({
          type: 'onSuggestionClicked:Response',
          data: payload
        })
        return
      }

      // ChatGPT is enabled and Response is good
      const configuration = new Configuration({
        apiKey: chatGPTToken
      })
      const openai = new OpenAIApi(configuration)
      const payload: CreateChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: response.value.prompt
          },
          {
            role: 'user',
            content: input
          }
        ]
      }
      const chatresponse = await openai.createChatCompletion({ ...payload })
      this._view.webview.postMessage({
        type: 'onSuggestionClickedGPT:Response',
        data: { ...chatresponse.data }
      })
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async handleRecommendationClick(input: string, initData: CurrentQuestionState): Promise<void> {
    if (this._view === null || this._view === undefined || !this._view.webview) {
      throw new Error('handleRecommendationClick: Webview is undefined')
    }

    if (!initData) {
      throw new Error('handleRecommendationClick: InitData is undefined or null')
    }

    const backendServiceConfig = BackendService()
    const chatGPTToken = GetChatGPTToken()
    const isChatConfigEnabled = backendServiceConfig === 'openai/chatgpt'

    if (isChatConfigEnabled === true && (chatGPTToken === '' || !chatGPTToken)) {
      window.showErrorMessage('Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected')
      throw new Error('Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected')
    }

    const sessionToken = new Session(this.extensionContext).get()?.value
    if (!sessionToken) {
      throw new Error('handleRecommendationClick: Session Token is undefined')
    }

    const suggestRecomendationPayload: SuggestRecomendationPayload = {
      problemId: initData.id,
      prompt: input,
      description: initData.vuln.description,
      context: '',
      recommendation: ''
    }

    try {
      const response = await explainService.RecommendSuggestion(
        suggestRecomendationPayload,
        sessionToken,
        isChatConfigEnabled
      )

      if (response.isErr()) {
        window.showErrorMessage(CONSTANTS.generateConnectionError)
        throw new Error('Something went wrong! Please try again')
      }

      if (response.value === null) {
        window.showErrorMessage(CONSTANTS.generateConnectionError)
        throw new Error('handleRecommendationClick: Response value is null')
      }

      if (!isChatConfigEnabled) {
        this._view?.webview.postMessage({
          type: 'onGenerateClicked:Response',
          data: response.value
        })
        return
      }

      const configuration = new Configuration({
        apiKey: chatGPTToken
      })
      const openai = new OpenAIApi(configuration)
      const payload: CreateChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: response.value.prompt
          },
          {
            role: 'user',
            content: input
          }
        ]
      }
      const chatresponse = await openai.createChatCompletion({ ...payload })
      this._view?.webview.postMessage({
        type: 'onGenerateClickedGPT:Response',
        data: { ...chatresponse.data }
      })
    } catch (error: any) {
      throw new Error(error)
    }
  }

  handleApplySuggestion(input: string, initData: CurrentQuestionState): void {
    const editor = window.activeTextEditor
    if (!editor || !initData) {
      throw new Error('handleApplySuggestion: Editor or InitData is Undefined')
    }

    const startLine = initData.vuln.startLine
    const comment = `\t\t#${input}`
    const position = new Position(startLine - 1, 0) // convert line number to position
    editor.edit((editBuilder: TextEditorEdit) => {
      editBuilder.insert(position, comment + '\n')
    })
  }

  postInitData(initData: CurrentQuestionState): void {
    if (this._view === null || this._view === undefined || this._view.webview === undefined) {
      return
    }
    if (!initData) return

    this._view.webview
      .postMessage({
        type: 'initData',
        data: { ...initData }
      })
      .then(undefined, err => {
        window.showErrorMessage(err)
      })
  }

  handleApplyRecommendation(input: string, initData: CurrentQuestionState): void {
    const editor = window.activeTextEditor
    if (!editor || !initData) {
      throw new Error('handleApplyRecommendation: Editor or Init Data is undefined')
    }

    const startLine = initData.vuln.startLine
    const endLine = initData.vuln.endLine
    const comment = `${input.replace('```', '')}`

    const data = initData.vuln
    const start = new Position(startLine - 1, 0) // convert line number to position
    const end = new Position(endLine, 0) // convert line number to position
    const range = new Range(start, end)
    editor.edit((editBuilder: TextEditorEdit) => {
      const decorations = GenerateDecorations([{ ...data }], editor)
      editor.setDecorations(decorations.decorationType, [])
      editBuilder.replace(range, comment + '\n')
    })
  }

  private activateMessageListener() {
    if (this._view === null || this._view === undefined || this._view.webview === undefined) {
      return
    }
    this._view.webview.onDidReceiveMessage(async (message: any) => {
      if (this._view === null || this._view === undefined || this._view.webview === undefined) {
        return
      }
      const data = message.data
      switch (message.type) {
        case 'onSuggestionClicked': {
          const input = data?.input
          const initData = data?.initData
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null')
            this._view.webview.postMessage({
              type: 'onSuggestionClicked:Error',
              data: {}
            })
            break
          }
          try {
            await this.handleSuggestionClick(input, initData)
            window.showInformationMessage(message.data)
          } catch {
            this._view.webview.postMessage({
              type: 'onSuggestionClicked:Error',
              data: {}
            })
          }
          break
        }
        case 'getInitData': {
          const state = this.getCurrentQuestionValue()
          this.postInitData(state)
          break
        }
        case 'initData:FixRecieved': {
          const initData = data?.initData
          await this.updateCurrentQuestionState({ ...initData, isFix: false })
          break
        }
        case 'initData:ResetRecieved': {
          const initData = data?.initData
          await this.updateCurrentQuestionState({ ...initData, isReset: false })
          break
        }
        case 'onGenerateClicked': {
          const input = data?.input
          const initData = data?.initData
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null')
            this._view.webview.postMessage({
              type: 'onGenerateClicked:Error',
              data: {}
            })
          }

          try {
            await this.handleRecommendationClick(input, initData)
            window.showInformationMessage(message.data)
          } catch {
            this._view.webview.postMessage({
              type: 'onGenerateClicked:Error',
              data: {}
            })
          }
          break
        }
        case 'applySuggestion': {
          const input = data?.input
          const initData = data?.initData
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null')
            this._view.webview.postMessage({
              type: 'applySuggestion:Error',
              data: {}
            })
            break
          }
          try {
            this.handleApplySuggestion(input, initData)
          } catch (error) {
            this._view.webview.postMessage({
              type: 'applySuggestion:Error',
              data: {}
            })
          }

          break
        }
        case 'applyRecommendation': {
          const input = data?.input
          const initData = data?.initData
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null')
            this._view.webview.postMessage({
              type: 'applyRecommendation:Error',
              data: {}
            })
            break
          }
          try {
            this.handleApplyRecommendation(input, initData)
          } catch {
            this._view.webview.postMessage({
              type: 'applyRecommendation:Error',
              data: {}
            })
          }
          break
        }
        case 'onEndorseSuggestionClicked': {
          const initData = data?.initData
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null')
            this._view.webview.postMessage({
              type: 'onEndorseSuggestionClicked:Error',
              data: {}
            })
            break
          }

          const payload: EndorseCommandHandler = {
            id: initData.id,
            path: initData.path
          }

          try {
            commands.executeCommand('metabob.endorseSuggestion', payload)
            this._view.webview.postMessage({
              type: 'onEndorseSuggestionClicked:Success',
              data: {}
            })
          } catch {
            this._view.webview.postMessage({
              type: 'onEndorseSuggestionClicked:Error',
              data: {}
            })
          }
          break
        }
        case 'onDiscardSuggestionClicked': {
          const initData = data?.initData
          if (initData === null || !initData) {
            window.showErrorMessage('Metabob: Init Data is null')
            this._view.webview.postMessage({
              type: 'onDiscardSuggestionClicked:Error',
              data: {}
            })
            break
          }
          const payload: DiscardCommandHandler = {
            id: initData.id,
            path: initData.path
          }
          try {
            commands.executeCommand('metabob.discardSuggestion', payload)
            this._view.webview.postMessage({
              type: 'onDiscardSuggestionClicked:Success',
              data: {}
            })
          } catch {
            this._view.webview.postMessage({
              type: 'onDiscardSuggestionClicked:Error',
              data: {}
            })
          }
          break
        }
        default:
          console.log(message)
      }
    })
  }

  private _getHtmlForWebview(webview: Webview) {
    const manifest = require(path.join(this.extensionPath, 'build', 'asset-manifest.json'))
    const mainScript = manifest['files']['main.js']
    const mainStyle = manifest['files']['main.css']

    const scriptUri = webview.asWebviewUri(Uri.joinPath(this.extensionURI, 'build', mainScript))
    const styleUri = webview.asWebviewUri(Uri.joinPath(this.extensionURI, 'build', mainStyle))

    // Use a nonce to whitelist which scripts can be run
    const nonce = Util.getNonce()

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<link rel="stylesheet" type="text/css" href="${styleUri}">
        <meta http-equiv="Content-Security-Policy" 
              content="default-src 'none'; 
              img-src vscode-resource: https:;
              script-src 'nonce-${nonce}';
              style-src vscode-resource: 'unsafe-inline' http: https: data:
        ;">
				<base href="${Uri.file(path.join(this.extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
        </script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}" src="https://cdn.tailwindcss.com"></script>
			</body>
			</html>`
  }
}
