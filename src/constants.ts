export const CONSTANTS = {
  // State Keys
  sessionKey: '@metabob/sessionToken',
  apiKey: '@metabob/apiKey',
  analyze: '@metabob/analyze',
  recomendations: '@metabob/recomendations',
  currentQuestion: '@metabob/currentquestion',

  // Command Registeration String
  analyzeDocumentCommand: 'metabob.analyzeDocument',
  discardSuggestionCommand: 'metabob.discardSuggestion',
  endorseSuggestionCommand: 'metabob.endorseSuggestion',

  // Command Messages
  endorseCommandSuccessMessage: 'Metabob: Thank you for endorsing the problem.',
  endorseCommandErrorMessage: 'Metabob: error in endorsing problem! Please try again later...',
  discardCommandErrorMessage: 'Metabob: error in discarding suggestion! Please try again later...',
  analyzeCommandProgressMessage: 'Metabob: Analyzing Document',
  analyzeCommandErrorMessage: 'Metabob: Error Analyzing the Document',

  // Error Constants
  editorNotSelectorError: 'Metabob: kindly select an editor to perform this command',
  editorSelectedIsInvalid: 'Metabob: selected document is invalid'
}
