type VSCode = {
  Uri: any;
  env: any;
  postMessage<T extends MessageType = MessageType>(message: T): void;
  getState(): any;
  setState(state: any): void;
};

declare const vscode: VSCode;
