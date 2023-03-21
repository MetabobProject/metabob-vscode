import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window, ExtensionContext } from 'vscode'
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
        switch (message.action) {
          case 'SHOW_WARNING_LOG':
            window.showWarningMessage(message.data.message)
            break
          default:
            break
        }
      })
    }
  }

  private _getHtmlForWebview(webview: Webview) {
    const nonce = Util.getNonce()
    const styleVSCodeUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'vscode.css'))
    const styleResetUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'reset.css'))
    const styleLocalUri = webview.asWebviewUri(Uri.joinPath(this.extensionPath, 'media', 'recomendation.css'))

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
                  <button class="small-button"> < </button>
                  <button class="small-button"> > </button>
                  <button class="med-button">Apply >></button>
                </div>
                <p class="description-content">content</p>
                <form style="display: flex; gap: 20px; ">
                  <input type="text" style="width: 80%"></input>
                  <button style="width: 20%">Ask</button>
                </form>
                <h4>Recomendation</h4>
                <p class="recomendation-content">recomendation</p>
                <form style="display: flex; gap: 20px; ">
                  <input type="text" style="width: 80%"></input>
                  <button style="width: 20%">Update</button>
                </form>
    </body>
    </html>`
  }
}
