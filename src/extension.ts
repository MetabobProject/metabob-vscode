import * as vscode from 'vscode'
import { analyzeDocumentOnSaveConfig } from './config'
import { SuggestionWebView } from './providers/suggestion.provider'
import { RecommendationWebView } from './providers/recommendation.provider'
import { activateAnalyzeCommand } from './commands/AnalyzeDocument'
import { Util } from './utils'
import { createUserSession } from './helpers/CreateSession'
import { AnalyzeDocumentOnSave } from './helpers/AnalyzeTextDocumentOnSave'
import { activateDiscardCommand } from './commands/discardSuggestion'
import { activateEndorseCommand } from './commands/endorseSuggestion'

let sessionInterval: any | null = null
export function activate(context: vscode.ExtensionContext) {
  const debug = vscode.window.createOutputChannel('Metabob-Debug')
  const analyzeDocumentOnSave = analyzeDocumentOnSaveConfig()

  createUserSession(context)
  sessionInterval = setInterval(() => {
    createUserSession(context)
  }, 60_000)

  activateAnalyzeCommand(context, debug)
  activateDiscardCommand(context, debug)
  activateEndorseCommand(context, debug)

  if (analyzeDocumentOnSave && analyzeDocumentOnSave === true) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
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

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('suggestion-panel-webview', new SuggestionWebView(context?.extensionUri))
  )

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'recommendation-panel-webview',
      new RecommendationWebView(context?.extensionUri)
    )
  )
}

export function deactivate() {
  if (sessionInterval) {
    clearInterval(sessionInterval)
  }
}
