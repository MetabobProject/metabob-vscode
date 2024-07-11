const CONSTANTS = {
  // State Keys
  sessionKey: '@metabob/sessionToken',
  apiKey: '@metabob/apiKey',
  analyze: '@metabob/analyze',
  recommendations: '@metabob/recommendations',
  currentQuestion: '@metabob/currentquestion',
  webview: '@metabob/webview',

  // Command Registration String
  analyzeDocumentCommand: 'metabob.analyzeDocument',
  discardSuggestionCommand: 'metabob.discardSuggestion',
  endorseSuggestionCommand: 'metabob.endorseSuggestion',
  fixSuggestionCommand: 'metabob.fixSuggestion',
  showDetailSuggestionCommand: 'metabob.showDetailSuggestion',

  // Command Messages
  endorseCommandSuccessMessage: 'Metabob: Thank you for endorsing the problem.',
  endorseCommandErrorMessage: 'Metabob: error in endorsing problem! Please try again later...',
  discardCommandErrorMessage: 'Metabob: error in discarding suggestion! Please try again later...',
  analyzeCommandProgressMessage: 'Metabob: Analyzing Document',
  analyzeCommandQueueMessage: 'Metabob: Document is Queued',
  analyzeCommandErrorMessage: 'Metabob: Error Analyzing the Document',
  analyzeCommandTimeoutMessage:
    'Metabob: your session has timed out. Please reload your editor window',
  applyRecommendationEror: 'Metabob: Could not apply recommendation to file',

  // Error Constants
  editorNotSelectorError: 'Metabob: kindly select an editor to perform this command',
  editorSelectedIsInvalid: 'Metabob: selected document is invalid',
  generateConnectionError: 'Metabob: Looks like the server is overloaded, please try again later',

  // Session
  sessionTokenUndefined: 'Metabob: your session has timed out. Please reload your editor window',

  // Document Provider
  recommendationDocumentProviderScheme: 'metabob',
};

export default CONSTANTS;
