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
import { GenerateDecorations } from '../helpers/GenerateDecorations'
import { explainService } from '../services/explain/explain.service'
import { currentQuestionState, ICurrentQuestionState } from '../state/CurrentQuestion'
import { SessionState } from '../state/Session'
import { Util } from '../utils'
import { backendService, getChatGPTToken } from '../config'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'
import { CONSTANTS } from '../constants'

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

  getCurrentState(): ICurrentQuestionState | undefined {
    const state = new currentQuestionState(this.extensionContext).get()

    return state?.value
  }

  clear(): void {
    new currentQuestionState(this.extensionContext).clear()
  }

  updateState(payload: ICurrentQuestionState): void | Thenable<void> {
    const state = new currentQuestionState(this.extensionContext).update(() => payload)

    return state
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

  handleSuggestionClick(input: string, initData: ICurrentQuestionState): void {
    const backendServiceConfig = backendService()
    if (!backendService) return
    const sessionKey = new SessionState(this.extensionContext).get()?.value

    explainService
      .explainProblem(
        {
          problemId: initData?.id as string,
          prompt: input,
          description: initData?.vuln?.description as string
        },
        sessionKey as string,
        backendServiceConfig === 'openai/chatgpt'
      )
      .then(async response => {
        if (backendServiceConfig === 'openai/chatgpt') {
          if (response.isOk()) {
            const token = getChatGPTToken()
            if (token === '' || !token) {
              window.showErrorMessage('Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected')
              this._view?.webview.postMessage({
                type: 'onSuggestionClicked:Error',
                data: {}
              })

              return
            }
            const configuration = new Configuration({
              apiKey: token
            })
            const openai = new OpenAIApi(configuration)
            const payload: CreateChatCompletionRequest = {
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',

                  // @ts-ignore
                  content: response.value.prompt
                },
                {
                  role: 'user',
                  content: input
                }
              ]
            }
            try {
              const chatresponse = await openai.createChatCompletion({ ...payload })
              this._view?.webview.postMessage({
                type: 'onSuggestionClickedGPT:Response',
                data: { ...chatresponse.data }
              })
            } catch (error) {
              this._view?.webview.postMessage({
                type: 'onSuggestionClicked:Error',
                data: {}
              })
            }
          }
        } else {
          if (response.isOk()) {
            const payload = response.value
            this._view?.webview.postMessage({
              type: 'onSuggestionClicked:Response',
              data: payload
            })
          }
        }
        if (response.isErr()) {
          if (this._view) {
            this._view.webview.postMessage({
              type: 'onSuggestionClicked:Error',
              data: {}
            })
            window.showErrorMessage(`Metabob: ${response.error.errorMessage} ${response.error.responseStatus}`)
          }
        }
      })
      .catch(() => {
        this._view?.webview.postMessage({
          type: 'onSuggestionClicked:Error',
          data: {}
        })
      })
  }

  handleRecommendationClick(input: string, initData: ICurrentQuestionState): void {
    const backendServiceConfig = backendService()
    if (!backendService) return
    const sessionKey = new SessionState(this.extensionContext).get()
    explainService
      .RecommendSuggestion(
        {
          problemId: initData?.id as string,
          prompt: input,
          description: initData?.vuln?.description as string,
          context: '',
          recommendation: ''
        },
        sessionKey?.value as string,
        backendServiceConfig === 'openai/chatgpt'
      )
      .then(async response => {
        if (response.isErr()) {
          if (this._view) {
            this._view?.webview.postMessage({
              type: 'onGenerateClicked:Error',
              data: {}
            })
            window.showErrorMessage(CONSTANTS.generateConnectionError)
          }

          return
        }
        if (backendServiceConfig === 'openai/chatgpt') {
          if (response.isOk()) {
            const token = getChatGPTToken()
            if (token === '' || !token) {
              window.showErrorMessage('Metabob: ChatGPT API Key is required when openai/chatgpt backend is selected')
              this._view?.webview.postMessage({
                type: 'onGenerateClicked:Error',
                data: {}
              })

              return
            }
            const configuration = new Configuration({
              apiKey: token
            })
            const openai = new OpenAIApi(configuration)
            const payload: CreateChatCompletionRequest = {
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',

                  // @ts-ignore
                  content: response.value.prompt
                },
                {
                  role: 'user',
                  content: input
                }
              ]
            }
            try {
              const chatresponse = await openai.createChatCompletion({ ...payload })
              this._view?.webview.postMessage({
                type: 'onGenerateClickedGPT:Response',
                data: { ...chatresponse.data }
              })
            } catch (error) {
              this._view?.webview.postMessage({
                type: 'onGenerateClicked:Error',
                data: {}
              })
            }
          }
        } else {
          if (response.isOk()) {
            const payload = response.value
            this._view?.webview.postMessage({
              type: 'onGenerateClicked:Response',
              data: payload
            })
          }
        }
      })
      .catch(() => {
        if (this._view) {
          this._view?.webview.postMessage({
            type: 'onGenerateClicked:Error',
            data: {}
          })
        }
      })
  }

  handleApplySuggestion(input: string, initData: ICurrentQuestionState): void {
    const editor = window.activeTextEditor
    if (!editor) {
      return
    }
    const startLine = initData.vuln?.startLine
    const comment = `\t\t#${input}`
    if (startLine) {
      const position = new Position(startLine - 1, 0) // convert line number to position

      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.insert(position, comment + '\n')
      })
    }
  }

  postInitData(initData: ICurrentQuestionState | undefined): void {
    this._view?.webview
      .postMessage({
        type: 'initData',
        data: { ...initData }
      })
      .then(undefined, err => {
        window.showErrorMessage(err)
      })
  }

  handleApplyRecommendation(input: string, initData: ICurrentQuestionState): void {
    const editor = window.activeTextEditor
    if (!editor) {
      return
    }
    const startLine = initData.vuln?.startLine
    const endLine = initData.vuln?.endLine
    const comment = `${input.replace('```', '')}`

    if (startLine && endLine && initData.vuln) {
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
  }

  private activateMessageListener() {
    if (this._view) {
      this._view.webview.onDidReceiveMessage((message: any) => {
        const data = message.data
        switch (message.type) {
          case 'onSuggestionClicked': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            this.handleSuggestionClick(input, initData)

            window.showInformationMessage(message.data)
            break
          }
          case 'getInitData': {
            const state = this.getCurrentState()
            this.postInitData(state)
            break
          }
          case 'initData:FixRecieved': {
            const initData = data?.initData
            this.updateState({ ...initData, isFix: false })
            break
          }
          case 'initData:ResetRecieved': {
            const initData = data?.initData
            this.updateState({ ...initData, isReset: false })
            break
          }
          case 'onGenerateClicked': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            this.handleRecommendationClick(input, initData)

            window.showInformationMessage(message.data)

            break
          }
          case 'applySuggestion': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            this.handleApplySuggestion(input, initData)

            break
          }
          case 'applyRecommendation': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            this.handleApplyRecommendation(input, initData)
            break
          }
          case 'onEndorseSuggestionClicked': {
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            try {
              commands.executeCommand('metabob.endorseSuggestion', {
                id: initData.id,
                path: initData.path
              })
              if (this._view) {
                this._view.webview.postMessage({
                  type: 'onEndorseSuggestionClicked:Success',
                  data: {}
                })
              }
            } catch (error) {
              if (this._view) {
                this._view.webview.postMessage({
                  type: 'onEndorseSuggestionClicked:Error',
                  data: {}
                })
              }
            }
            break
          }
          case 'onDiscardSuggestionClicked': {
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            try {
              commands.executeCommand('metabob.discardSuggestion', {
                id: initData.id,
                path: initData.path
              })
              if (this._view) {
                this._view.webview.postMessage({
                  type: 'onDiscardSuggestionClicked:Success',
                  data: {}
                })
              }
            } catch (error) {
              if (this._view) {
                this._view.webview.postMessage({
                  type: 'onDiscardSuggestionClicked:Error',
                  data: {}
                })
              }
            }

            break
          }
          default:
            console.log(message)
        }
      })
    }
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
