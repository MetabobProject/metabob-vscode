import * as vscode from 'vscode'
import { analyzeDocumentOnSaveConfig } from './config'
import { RecommendationWebView } from './providers/recommendation.provider'
import { activateAnalyzeCommand } from './commands/AnalyzeDocument'
import { Util } from './utils'
import { createOrUpdateUserSession } from './helpers/CreateOrUpdateUserSession'
import { AnalyzeDocumentOnSave } from './helpers/AnalyzeTextDocumentOnSave'
import { activateDiscardCommand } from './commands/discardSuggestion'
import { activateEndorseCommand } from './commands/endorseSuggestion'
import { activateFocusRecomendCommand } from './commands/focusRecomendation'
import { activateDetailSuggestionCommand } from './commands/detailDocument'

// let sessionInterval: NodeJS.Timer | null = null
export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug')
  const analyzeDocumentOnSave = analyzeDocumentOnSaveConfig()

  // Create User Session, If already created get the refresh token
  // otherwise, ping server every 60 second to not destory the token
  // if the user has not done any activity
  createOrUpdateUserSession(context)

  // TODO: Redo this implementation. at the moment Bug seems to be on the extension host end.
  // https://github.com/microsoft/vscode/issues/109014#issuecomment-712913566

  // if (!sessionInterval) {
  //   sessionInterval = setInterval(() => {
  //     createOrUpdateUserSession(context, debug)
  //   }, 60_000)
  // }

  // Analyze command that hit /analyze endpoint with current file content
  // then decorate current file with error
  activateAnalyzeCommand(context, debug)

  // If the user Discard a suggestion, it would be removed from decoration
  // and the global state as well
  activateDiscardCommand(context, debug)

  // If the user feels suggestion is good, he can endorse that suggestion
  // Used to notify the model about positive feedback
  activateEndorseCommand(context, debug)

  // Depreceated
  activateFocusRecomendCommand(context, debug)

  // When the user click the detail button on the problem
  activateDetailSuggestionCommand(context, debug)

  // Analyze on Save functionality is only ran if the user enabled it.
  if (analyzeDocumentOnSave && analyzeDocumentOnSave === true) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        // Will check if the current document is valid code file.
        if (Util.isValidDocument(document)) {
          AnalyzeDocumentOnSave(
            {
              document
            },
            context
          )
        }
      })
    )
  }

  // If the user changes the global config from CMD + Shift + P -> User Setting -> Metabob
  // Then, we would update global state or reload the application
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('metabob.apiKey') === true) {
        vscode.window.showInformationMessage('Metabob: API Key Changed')

        return
      }
      if (e.affectsConfiguration('metabob.baseURl') === true) {
        vscode.window.showInformationMessage('Metabob: Base URL Changed')

        return
      }
      if (e.affectsConfiguration('metabob.analyzeDocumentOnSave') === true) {
        const reloadWindowItem = { title: 'Reload Window' }
        vscode.window
          .showInformationMessage('Reload the window to apply changes?', reloadWindowItem)
          .then(selection => {
            if (selection === reloadWindowItem) {
              vscode.commands.executeCommand('workbench.action.reloadWindow')

              return
            }

            return
          })
      }
    })
  )

  // Recomendation Panel Webview Provider that is the normal Metabob workflow
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'recommendation-panel-webview',
      new RecommendationWebView(context?.extensionUri, context)
    )
  )
}

// Since, We don't want to get Refresh Tokens after User has closed the extension
// So we will clear Session Interval upon deactivate
export function deactivate() {
  // if (sessionInterval) {
  //   clearInterval(sessionInterval)
  // }
}
