import vscode from 'vscode';
import { Analyze } from '../state';

export const handleAnalyzeExpiration = (context: vscode.ExtensionContext): void => {
  const today = new Date();
  const analyzeState = new Analyze(context);

  analyzeState.update(state => {
    Object.keys(state).forEach(path => {
      const analyses = state[path];

      for (let i = analyses.length - 1; i >= 0; i--) {
        // If the expiration field on analyzeState does not exist; discard it.
        if (!analyses[i]?.expiration) {
          analyses.splice(i, 1);
          continue;
        }

        // If the analysis is expired, discard it as well.
        // Ensure both dates are in the same timezone (e.g., UTC)
        const todayUTC = new Date(today.toISOString());
        const problemDate = new Date(analyses[i].expiration);
        if (problemDate < todayUTC) {
          analyses.splice(i, 1);
          continue;
        }
      }

      if (analyses.length === 0) {
        delete state[path];
      }
    });

    return state;
  });

  return;
};
