type VSCode = {
  Uri: any
  env: any
  postMessage<T extends Message = Message>(message: T): void
  getState(): any
  setState(state: any): void
}

declare const vscode: VSCode
