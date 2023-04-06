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
  Range
} from 'vscode'
import { GenerateDecorations } from '../helpers/GenerateDecorations'
import { explainService } from '../services/explain/explain.service'
import { currentQuestionState, ICurrentQuestionState } from '../store/currentQuestion.state'
import { SessionState } from '../store/session.state'
import { Util } from '../utils'

export class ChatGPTViewerProvider implements WebviewViewProvider {
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

  private activateMessageListener() {
    if (this._view) {
      this._view.webview.onDidReceiveMessage((message: any) => {
        const data = message.data
        switch (message.type) {
          case 'onSuggestionClicked': {
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
            break
          }
          case 'applySuggestion': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
            }

            break
          }
          case 'applyRecomendation': {
            const input = data?.input
            const initData = data?.initData
            if (initData === null) {
              window.showErrorMessage('Metabob: Init Data is null')

              return
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
    const styleLocalUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'chat.css'))
    const chatjs = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'chat.js'))

    const chatUI = /*html*/ ` 
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
        <section class="chatbox">
            <section class="chat-window">
                <article class="msg-container msg-remote" id="msg-0">
                    <div class="msg-box">
                        <img class="user-img" id="user-0" src="https://gravatar.com/avatar/00034587632094500000000000000000?d=retro" />
                        <div class="flr">
                            <div class="messages">
                                <p class="msg" id="msg-0">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent varius, neque non tristique tincidunt, mauris nunc efficitur erat, elementum semper justo odio id nisi.
                                </p>
                            </div>
                            <span class="timestamp"><span class="username">Name</span>&bull;<span class="posttime">3 minutes ago</span></span>
                        </div>
                    </div>
                </article>
                <article class="msg-container msg-self" id="msg-0">
                    <div class="msg-box">
                        <div class="flr">
                            <div class="messages">
                                <p class="msg" id="msg-1">
                                    Lorem ipsum dolor sit amet
                                </p>
                                <p class="msg" id="msg-2">
                                    Praesent varius
                                </p>
                            </div>
                            <span class="timestamp"><span class="username">Name</span>&bull;<span class="posttime">2 minutes ago</span></span>
                        </div>
                        <img class="user-img" id="user-0" src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />
                    </div>
                </article>
                <article class="msg-container msg-remote" id="msg-0">
                    <div class="msg-box">
                        <img class="user-img" id="user-0" src="https://gravatar.com/avatar/002464562345234523523568978962?d=retro" />
                        <div class="flr">
                            <div class="messages">
                                <p class="msg" id="msg-0">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                </p>
                            </div>
                            <span class="timestamp"><span class="username">Name</span>&bull;<span class="posttime">1 minute ago</span></span>
                        </div>
                    </div>
                </article>
                <article class="msg-container msg-remote" id="msg-0">
                    <div class="msg-box">
                        <img class="user-img" id="user-0" src="https://gravatar.com/avatar/00034587632094500000000000000000?d=retro" />
                        <div class="flr">
                            <div class="messages">
                                <p class="msg" id="msg-0">
                                    Lorem ipsum dolor sit amet.
                                </p>
                            </div>
                            <span class="timestamp"><span class="username">Name</span>&bull;<span class="posttime">Now</span></span>
                        </div>
                    </div>
                </article>
                <article class="msg-container msg-self" id="msg-0">
                    <div class="msg-box">
                        <div class="flr">
                            <div class="messages">
                                <p class="msg" id="msg-1">
                                    Lorem ipsum
                                </p>
                            </div>
                            <span class="timestamp"><span class="username">Name</span>&bull;<span class="posttime">Now</span></span>
                        </div>
                        <img class="user-img" id="user-0" src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />
                    </div>
                </article>
            </section>
            <form class="chat-input" onsubmit="return false;">
                <input type="text" autocomplete="on" placeholder="Type a message" />
                <button>
                        <svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="rgba(0,0,0,.38)" d="M17,12L12,17V14H8V10H12V7L17,12M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" /></svg>
                    </button>
            </form>
        </section>
        <script nonce='${nonce}' src='${chatjs}'></script>
    </body>
</html>`
    return chatUI
  }
}
