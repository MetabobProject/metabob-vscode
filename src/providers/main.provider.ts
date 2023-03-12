import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window } from 'vscode';
import { Util } from '../utils';

export class LeftPanelWebview implements WebviewViewProvider {
  private _view?: WebviewView | null = null;
  private readonly extensionPath: Uri;

  constructor(extensionPath: Uri) {
    this.extensionPath = extensionPath;
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<
    any | undefined | null | void
  >();

  refresh(): void {
    this.onDidChangeTreeData.fire(null);
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
    }
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionPath],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    this._view = webviewView;
    this.activateMessageListener();
  }

  private activateMessageListener() {
    if (this._view) {
      this._view.webview.onDidReceiveMessage((message: any) => {
        switch (message.action) {
          case 'SHOW_WARNING_LOG':
            window.showWarningMessage(message.data.message);
            break;
          default:
            break;
        }
      });
    }
  }

  private _getHtmlForWebview(webview: Webview) {
    const nonce = Util.getNonce();
    const styleVSCodeUri = webview.asWebviewUri(
      Uri.joinPath(this.extensionPath, 'media', 'vscode.css')
    );
    const styleResetUri = webview.asWebviewUri(
      Uri.joinPath(this.extensionPath, 'media', 'reset.css')
    );

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
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                </head>
               <body>
                <h1>hello</h1>
                <button>hello</button>
              </body>
            </html>`;
  }
}
