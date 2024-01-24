// Global Types that are shared between extension and webview (React)

// Types for message types
export enum MessageType {
  ANALYSIS_CURRENT_FILE,
  OPEN_EXTERNAL_LINK,
  ON_SUGGESTION_CLICK
}

// Define a base message type with a 'type' property
interface BaseMessage {
  type: MessageType
}

// Define types for each message and its associated data
interface AnalysisCurrentFileMessage extends BaseMessage {
  type: MessageType.ANALYSIS_CURRENT_FILE
}

interface OpenExternalLinkMessage extends BaseMessage {
  type: MessageType.OPEN_EXTERNAL_LINK
  data: {
    url: string
  }
}

interface OnSuggestionClickedMessage extends BaseMessage {
  type: MessageType.ON_SUGGESTION_CLICK
  data: {
    input: string
    initData: {
      isReset?: boolean
      isFix?: boolean
    }
  }
}

// Union type for all possible messages
export type ExtensionMessage = AnalysisCurrentFileMessage | OpenExternalLinkMessage | OnSuggestionClickedMessage
