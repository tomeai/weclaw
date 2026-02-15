/**
 * CopilotKit type definitions for chat-engine integration
 */

// ─── AG-UI Event Types ────────────────────────────────────────────────────────

export type AGUIEventType =
  | "TEXT_MESSAGE_START"
  | "TEXT_MESSAGE_CONTENT"
  | "TEXT_MESSAGE_END"
  | "TOOL_CALL_START"
  | "TOOL_CALL_ARGS"
  | "TOOL_CALL_END"
  | "TOOL_CALL_RESULT"
  | "THINKING_TEXT_MESSAGE_START"
  | "THINKING_TEXT_MESSAGE_CONTENT"
  | "THINKING_TEXT_MESSAGE_END"
  | "THINKING_START"
  | "THINKING_END"
  | "STATE_SNAPSHOT"
  | "STATE_DELTA"
  | "MESSAGES_SNAPSHOT"
  | "RAW"
  | "CUSTOM"
  | "RUN_STARTED"
  | "RUN_FINISHED"
  | "RUN_ERROR"
  | "STEP_STARTED"
  | "STEP_FINISHED"

// ─── AG-UI Event Interfaces ───────────────────────────────────────────────────

export interface AGUITextMessageStartEvent {
  type: "TEXT_MESSAGE_START"
  messageId: string
  role?: "assistant" | "user" | "system" | "developer"
  parentMessageId?: string
}

export interface AGUITextMessageContentEvent {
  type: "TEXT_MESSAGE_CONTENT"
  messageId: string
  delta: string
}

export interface AGUITextMessageEndEvent {
  type: "TEXT_MESSAGE_END"
  messageId: string
}

export interface AGUIToolCallStartEvent {
  type: "TOOL_CALL_START"
  toolCallId: string
  toolCallName: string
  parentMessageId?: string
}

export interface AGUIToolCallArgsEvent {
  type: "TOOL_CALL_ARGS"
  toolCallId: string
  delta: string
}

export interface AGUIToolCallEndEvent {
  type: "TOOL_CALL_END"
  toolCallId: string
}

export interface AGUIToolCallResultEvent {
  type: "TOOL_CALL_RESULT"
  toolCallId: string
  content: string
  messageId: string
  role?: "tool"
}

export interface AGUIRunStartedEvent {
  type: "RUN_STARTED"
  threadId: string
  runId: string
  parentRunId?: string
}

export interface AGUIRunFinishedEvent {
  type: "RUN_FINISHED"
  threadId: string
  runId: string
  result?: unknown
}

export interface AGUIRunErrorEvent {
  type: "RUN_ERROR"
  message: string
  code?: string
}

export type AGUIEvent =
  | AGUITextMessageStartEvent
  | AGUITextMessageContentEvent
  | AGUITextMessageEndEvent
  | AGUIToolCallStartEvent
  | AGUIToolCallArgsEvent
  | AGUIToolCallEndEvent
  | AGUIToolCallResultEvent
  | AGUIRunStartedEvent
  | AGUIRunFinishedEvent
  | AGUIRunErrorEvent

// ─── CopilotKit Forwarded Props ───────────────────────────────────────────────

/**
 * Props that can be forwarded to the backend agent
 * Used to pass context like agent, MCPs, and skills
 */
export interface CopilotKitForwardedProps {
  /** Selected agent context */
  agent?: {
    type: "agent"
    owner: string
    name: string
    label: string
  }
  /** Selected MCP servers */
  mcps?: Array<{
    owner: string
    name: string
  }>
  /** Selected skills */
  skills?: Array<{
    owner: string
    name: string
  }>
}

// ─── CopilotKit Message Types ─────────────────────────────────────────────────

/**
 * CopilotKit visible message format
 */
export interface CopilotKitMessage {
  id: string
  content: string | Array<{ type: string; text?: string; [key: string]: unknown }>
  role: "user" | "assistant" | "system"
  createdAt?: Date
  isTextMessage?: boolean
  isActionExecutionMessage?: boolean
  isResultMessage?: boolean
  toolCalls?: Array<{
    function: {
      name: string
      arguments: string
    }
    id: string
    type: "function"
  }>
  toolCallId?: string
}

// ─── Hook Options ─────────────────────────────────────────────────────────────

/**
 * Options for useCopilotChatAdapter hook
 */
export interface UseCopilotChatAdapterOptions {
  /** CopilotKit chat id for sharing state */
  id?: string
  /** Initial messages to populate */
  initialMessages?: CopilotKitMessage[]
  /** Headers to send with requests */
  headers?: Record<string, string> | (() => Record<string, string>)
}
