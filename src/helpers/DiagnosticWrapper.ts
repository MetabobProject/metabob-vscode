import * as vscode from 'vscode';

class DiagnosticCollectionWrapper {
  private collection: vscode.DiagnosticCollection;

  constructor(name: string) {
    this.collection = vscode.languages.createDiagnosticCollection(name);
  }

  public set(uri: vscode.Uri, diagnostics: vscode.Diagnostic[]) {
    this.collection.set(uri, diagnostics);
  }

  public clear() {
    this.collection.clear();
  }

  public dispose() {
    this.collection.dispose();
  }
}

let diagnosticCollection: DiagnosticCollectionWrapper | null = null;
if (!diagnosticCollection) {
  diagnosticCollection = new DiagnosticCollectionWrapper('metabob');
}
export { diagnosticCollection };
