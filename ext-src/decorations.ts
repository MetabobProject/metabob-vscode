import * as vscode from 'vscode';

const removedTextBackgroundColor = new vscode.ThemeColor('diffEditor.removedTextBackground');
const insertedTextBackgroundColor = new vscode.ThemeColor('diffEditor.insertedTextBackground');

export const problemDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: removedTextBackgroundColor,
  isWholeLine: true,
  overviewRulerLane: 7,
  overviewRulerColor: removedTextBackgroundColor,
});

export const recommendationDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: insertedTextBackgroundColor,
  isWholeLine: true,
  overviewRulerLane: 7,
  overviewRulerColor: insertedTextBackgroundColor,
});