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
  endorseCommandSuccessMessage: 'Metabob: Thank you for Endorsing The Problem.',
  endorseCommandErrorMessage: 'Metabob: Error Endorsing Problem! Please try again later...',
  discardCommandErrorMessage: 'Metabob: Error Discard Suggestion! Please try again later...',

  // Error Constants
  editorNotSelectorError: 'Metabob: Kindly select an editor to perform this command',
  editorSelectedIsInvalid: 'Metabob: Selected Document Is Invalid'
}
