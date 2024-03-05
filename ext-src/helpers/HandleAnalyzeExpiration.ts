import vscode from "vscode";
import { Analyze, AnalyzeState } from "../state";

export const handleAnalyzeExpiration = (context: vscode.ExtensionContext) => {
    const today = new Date();
    let results: AnalyzeState = {};
    const setAnalyzeState = new Analyze(context)
    const analyzeStateValue = new Analyze(context).get()?.value;

    if (!analyzeStateValue) return undefined;

    // If the expiration field on analyzeState does not exist; discard it.
    Object.keys(analyzeStateValue).forEach(key => {
        const problem = analyzeStateValue[key];
        if (problem.expiration !== undefined) {
            results[key] = { ...problem }
        }
    });

    let nonExpiredResults: AnalyzeState = {};

    // If the problem is expired, discard it as well.
    Object.keys(results).forEach(key => {
        const problem = analyzeStateValue[key];
        if (problem.expiration) {
            // Ensure both dates are in the same timezone (e.g., UTC)
            const todayUTC = new Date(today.toISOString());
            const problemDate = new Date(problem.expiration)
            if (problemDate >= todayUTC) {
                nonExpiredResults[key] = { ...problem }
            }
        }
    });

    setAnalyzeState.set(nonExpiredResults);
    return
}