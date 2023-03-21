import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window, ExtensionContext } from 'vscode'
import { currentQuestionState } from '../store/currentQuestion.state'
import { Util } from '../utils'

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

  private activateMessageListener() {
    if (this._view) {
      this._view.webview.onDidReceiveMessage((message: any) => {
        switch (message.type) {
          case 'onSuggestionClicked': {
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

    return /*html*/ `
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
                <h4 id="category-text">CATEGORY: </h4>
                <div class="button-group">
                  <button id="back-button" class="small-button"> < </button>
                  <button id="forward-button" class="small-button"> > </button>
                  <button id="apply-suggestion-button" class="med-button">Apply >></button>
                </div>
                <div class="card">
                <p id="description-content" class="description-content">content</p>
                <div style="display: flex; gap: 10px;">
                  <input id="explain-input" type="text" style="width: 80%"></input>
                  <button id="explain-submit" style="width: 15%">Ask</button>
                </div>
                </div>

                <h4><b>Recomendation</b></h4>
                <div class="card">
                <p class="recomendation-content">recomendation</p>
                <form style="display: flex; gap: 10px; ">
                  <input type="text" style="width: 80%"></input>
                  <button style="width: 15%">Update</button>
                </form>
                </div>
           <script nonce="${nonce}" src="${recomendationScriptUri}"></script>
    </body>
    </html>`
  }
}
