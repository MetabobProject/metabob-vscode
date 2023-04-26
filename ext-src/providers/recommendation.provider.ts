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
import { currentQuestionState, ICurrentQuestionState } from '../store/currentQuestion.state'
import { SessionState } from '../store/session.state'
import { Util } from '../utils'
import { backendService, getChatGPTToken } from '../config'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'

export class RecommendationWebView implements WebviewViewProvider {
  private _view?: WebviewView | null = null
  private readonly extensionPath: string
  private readonly extensionURI: Uri
  private readonly extensionContext: ExtensionContext

  constructor(extensionPath: string, extensionURI: Uri, context: ExtensionContext) {
    this.extensionPath = extensionPath
    this.extensionURI = extensionURI
    this.extensionContext = context
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<
    any | undefined | null | void
  >()

  getCurrentState() {
    const state = new currentQuestionState(this.extensionContext).get()

    return state?.value
  }

  updateState(payload: any) {
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
  handleSuggestionClick(input: string, initData: ICurrentQuestionState) {
    const backendServiceConfig = backendService()
    if (!backendService) return
    let sessionKey = new SessionState(this.extensionContext).get()?.value
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

  handleRecomendationClick(input: string, initData: ICurrentQuestionState) {
    const backendServiceConfig = backendService()
    if (!backendService) return
    const sessionKey = new SessionState(this.extensionContext).get()
    explainService
      .recomendSuggestion(
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
            window.showErrorMessage(`Metabob: ${response.error.errorMessage} ${response.error.responseStatus}`)
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

  handleApplySuggestion(input: string, initData: ICurrentQuestionState) {
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

  handleApplyRecomendation(input: string, initData: ICurrentQuestionState) {
    const editor = window.activeTextEditor
    if (!editor) {
      return
    }
    const startLine = initData.vuln?.startLine
    const endLine = initData.vuln?.endLine
    const comment = `${input.replace('```', '').replace('\n', '\\n')}`

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
            this._view?.webview.postMessage({
              type: 'initData',
              data: { ...state }
            })
            break
          }
          case 'initData:FixRecieved': {
            const initData = data?.initData
            this.updateState({ ...initData, isFix: false })
            break
          }
          case 'onGenerateClicked': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            this.handleRecomendationClick(input, initData)

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
          case 'applyRecomendation': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }
            this.handleApplyRecomendation(input, initData)
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
  // private _getHtmlForWebview(webview: Webview) {
  //   const nonce = Util.getNonce()
  //   const styleVSCodeUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'vscode.css'))
  //   const styleResetUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'reset.css'))
  //   const styleLocalUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'recomendation.css'))
  //   const recomendationScriptUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'recomendation.js'))

  //   const normalMetabobUI = /*html*/ `
  //   <html>
  //   <head>
  //                   <meta charSet="utf-8"/>
  //                   <meta http-equiv="Content-Security-Policy"
  //                           content="default-src 'none';
  //                           img-src vscode-resource: https:;
  //                           font-src ${webview.cspSource};
  //                           style-src ${webview.cspSource} 'unsafe-inline';
  //                           script-src 'nonce-${nonce}'

  //                   ;">
  //                   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //                   <link href="${styleLocalUri}" rel="stylesheet">
  //                   <link href="${styleResetUri}" rel="stylesheet">
  //                   <link href="${styleVSCodeUri}" rel="stylesheet">

  // </head>
  // <body>

  //             <div style="w-100">
  //                 <span class="font-bold text-clifford text-1xl">
  //                     Problem Category:
  //                 </span>
  //                 <span id="category-text" class="whitespace-pre-wrap">
  //                 </span>
  //             </div>
  //             <div style="w-100">
  //                 <span class="font-bold text-clifford text-1xl antialiased">
  //                   Problem Description:
  //                 </span>
  //                 <span id="question-description" class="antialiased whitespace-pre-wrap">
  //                 </span>
  //             </div>

  //               <div class="flex flex-wrap my-3 flex-row mx-auto space-x-4 ">
  //                   <div>
  //                     <button id="discard-suggestion" class="flex-none p-1 shadow-sm font-medium antialiased loading-button">Discard</button>
  //                   </div>
  //                   <div>
  //                     <button id="endorse-suggestion" class="flex-none  p-1 shadow-sm font-medium antialiased loading-button">Endorse</button>
  //                   </div>
  //               </div>

  //               <div class="w-90">
  //                 <div class="my-3 w-100">
  //                   <p id="description-content" class="whitespace-pre-wrap"></p>
  //                   <div style="display: flex; gap: 10px;" class="flex-wrap">
  //                     <input id="explain-input" type="text" style="width: 80%" class="focus:outline-none"></input>
  //                     <button id="explain-submit" style="width: 15%" class="flex-none shadow-sm text-xs loading-button focus:outline-none">Ask</button>
  //                   </div>
  //                 </div>
  //                 <div class="flex flex-wrap my-3 flex-row mx-auto justify-between">
  //                     <span class="font-bold text-clifford text-1xl transition duration-300 antialiased">Recomendation</span>
  //                     <span class="order-last basis-1/4">
  //                       <button id="gen-recom" class="antialiased shadow-sm text-xs transition duration-300">
  //                         <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
  //                         <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
  //                         <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
  //                         </svg>
  //                         Generate
  //                       </button>
  //                     </span>
  //                 </div>
  //             </div>

  //         </div>
  //          <script nonce="${nonce}" src="${recomendationScriptUri}"></script>
  //          <script nonce="${nonce}" src="https://cdn.tailwindcss.com"></script>

  //   </body>
  //   </html>`

  //   return normalMetabobUI
  // }
}
