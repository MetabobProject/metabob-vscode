import * as path from 'path';
import * as vscode from 'vscode';
import { CONSTANTS } from './constants';

export class Util {
  static context: vscode.ExtensionContext;

  static getSessionToken() {
    return this.context.globalState.get<string>(CONSTANTS.sessionKey) || '';
  }

  static isLoggedIn() {
    return (
      !!this.context.globalState.get(CONSTANTS.sessionKey) &&
      !!this.context.globalState.get(CONSTANTS.apiKey)
    );
  }

  static getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  static sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  static getWorkspacePath() {
    const folders = vscode.workspace.workspaceFolders;
    return folders ? folders![0].uri.fsPath : undefined;
  }

  static getResource(rel: string) {
    return path
      .resolve(this.context.extensionPath, rel.replace(/\//g, path.sep))
      .replace(/\\/g, '/');
  }
}
