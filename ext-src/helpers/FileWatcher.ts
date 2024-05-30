import * as vscode from 'vscode';
import * as fs from 'fs';
import { extractRelevantInformation, updateContext, globalContext} from './ContextExtractor';

export function initializeFileWatcher(repoPath: string, context: vscode.ExtensionContext) {

    // Create a file system watcher for README.md files in the repoPath
    const fileWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(repoPath, '**/README.md')
    );

    // Event handlers for file changes
    fileWatcher.onDidChange((uri) => handleFileChange(uri));
    fileWatcher.onDidCreate((uri) => handleFileChange(uri));
    fileWatcher.onDidDelete((uri) => handleFileDelete(uri));

    // Find all README.md files in the workspace and process them
    vscode.workspace.findFiles('**/README.md', '**/node_modules/**', 10)
    .then(uris => uris.forEach(uri => handleFileChange(uri)));

    // Add the file watcher to the subscriptions which will be disposed when the extension is deactivated
    context.subscriptions.push(fileWatcher);

    return fileWatcher;
}

function handleFileChange(uri: vscode.Uri) {
    const readmeContent = fs.readFileSync(uri.fsPath, 'utf-8');
    const context = extractRelevantInformation(readmeContent); // Extract relevant information from the README content by calling the extractRelevantInformation function
    updateContext(context);
}

function handleFileDelete(uri: vscode.Uri) {
    const filePath = uri.fsPath;
    updateContext({});
}
