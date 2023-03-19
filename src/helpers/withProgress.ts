import * as vscode from 'vscode'

export async function withProgress<T>(task: Promise<T>, title: string): Promise<T> {
  return await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: title,
      cancellable: false
    },
    async _ => {
      return await task
    }
  )
}
