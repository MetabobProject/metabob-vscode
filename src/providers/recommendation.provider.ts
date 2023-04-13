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
  private readonly extensionPath: Uri
  private readonly extensionContext: ExtensionContext

  constructor(extensionPath: Uri, context: ExtensionContext) {
    this.extensionPath = extensionPath
    this.extensionContext = context
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<
    any | undefined | null | void
  >()

  getCurrentState() {
    const state = new currentQuestionState(this.extensionContext).get()

    return state?.value
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
      localResourceRoots: [this.extensionPath]
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
    const nonce = Util.getNonce()
    const styleVSCodeUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'vscode.css'))
    const styleResetUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'reset.css'))
    const styleLocalUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'recomendation.css'))
    const recomendationScriptUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'recomendation.js'))

    const normalMetabobUI = /*html*/ ` 
    <html>
    <head>
                    <meta charSet="utf-8"/>
                    <meta http-equiv="Content-Security-Policy" 
                            content="default-src 'none';
                            img-src vscode-resource: https:;
                            font-src ${webview.cspSource};
                            style-src ${webview.cspSource} 'unsafe-inline';
                            script-src 'nonce-${nonce}'
                            
                    ;">             
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${styleLocalUri}" rel="stylesheet">
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                    
  </head>
  <body>
                
              <div style="w-100">
                  <span class="font-bold text-clifford text-1xl">
                      Problem Category:
                  </span>
                  <span id="category-text">
                  </span>
              </div>
              <div style="w-100">
                  <span class="font-bold text-clifford text-1xl">
                    Problem Description:
                  </span>                      
                  <span id="question-description">
                  </span>
              </div>
                
              <div class="flex flex-row mx-auto space-x-4">
                  <div>
                    <button id="discard-suggestion" class="flex-none p-1 shadow-sm font-medium loading-button">Discard</button>
                  </div>
                  <div>
                    <button id="endorse-suggestion" class="flex-none p-1 shadow-sm font-medium loading-button">Endorse</button>                
                  </div>
              </div>
             
                <div class="p-1">
                  <p id="description-content"></p>
                  <div style="display: flex; gap: 10px;">
                    <input id="explain-input" type="text" style="width: 80%"></input>
                    <button id="explain-submit" style="width: 15%" class="loading-button">Ask</button>
                  </div>
                </div>
                <div class="flex flex-row mx-auto space-x-4">
                    <span class="font-bold text-clifford text-1xl basis-1/4">Recomendation</span>
                    <span class="font-bold text-clifford text-1xl basis-1/4"></span>
                    <span class="font-bold text-clifford text-1xl basis-1/4"></span>
                    <span class="order-last basis-1/4"> 
                      <button id="gen-recom" class="flex-none p-1 shadow-sm font-medium loading-button">
                        Generate
                      </button>
                    </span>
                </div>
          </div>
           <script nonce="${nonce}" src="${recomendationScriptUri}"></script>
           <script nonce="${nonce}" src="https://cdn.tailwindcss.com"></script>

    </body>
    </html>`

    return normalMetabobUI
  }
}
