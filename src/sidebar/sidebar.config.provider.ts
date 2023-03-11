import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Create a WebviewPanel to show the sidebar
  const panel = vscode.window.createWebviewPanel(
    'mySidebar', // unique identifier
    'My Sidebar', // title
    vscode.ViewColumn.Beside, // column
    {
      enableScripts: true, // allow running scripts
    }
  );

  // Set the Webview HTML content
  panel.webview.html = getWebviewContent();

  // Handle the Authenticate button click
  panel.webview.onDidReceiveMessage(
    async message => {
      if (message.type === 'authenticate') {
        // Get the API key from the configuration
        const apiKey = vscode.workspace.getConfiguration().get('myExtension.apiKey');

        // TODO: Authenticate with the API using the API key

        // Show a success message
        vscode.window.showInformationMessage('Authenticated successfully!');
      }
    },
    undefined,
    context.subscriptions
  );
}

function getWebviewContent() {
  // Get the API key from the configuration
  const apiKey = vscode.workspace.getConfiguration().get('myExtension.apiKey');

  // Generate the Webview HTML content
  return `
        <html>
            <body>
                <h1>My Sidebar</h1>
                <form>
                    <label for="apiKey">API Key:</label>
                    <input type="text" id="apiKey" name="apiKey" value="${apiKey}">
                </form>
                <button id="authenticate">Authenticate</button>
                <script>
                    // Handle the Authenticate button click
                    const authenticateButton = document.getElementById('authenticate');
                    authenticateButton.addEventListener('click', () => {
                        // Send a message to the extension to authenticate
                        vscode.postMessage({
                            type: 'authenticate'
                        });
                    });
                </script>
            </body>
        </html>
    `;
}
