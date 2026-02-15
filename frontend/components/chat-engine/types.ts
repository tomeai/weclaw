// ─── Content Types ────────────────────────────────────────────────────────────

export type ContentItemText = { type: "text"; text: string }
export type ContentItemToolUse = {
  type: "tool_use"
  id: string
  name: string
  input: Record<string, unknown>
}
export type ContentItemToolResult = {
  type: "tool_result"
  tool_use_id: string
  content: string
}

export type ContentItem =
  | ContentItemText
  | ContentItemToolUse
  | ContentItemToolResult

// ─── Message Types ─────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: ContentItem[]
  isStreaming?: boolean
}

// ─── SSE Types ────────────────────────────────────────────────────────────────

export interface SSEEvent {
  id: string
  type: "content_block_delta"
  content: ContentItem
}

// ─── Request Context ──────────────────────────────────────────────────────────

export interface SelectedContext {
  type: "mcp" | "skill" | "agent"
  owner: string
  name: string
  label: string
}

export interface RequestContext {
  agent?: SelectedContext
  mcps: SelectedContext[]
  skills: SelectedContext[]
}

// ─── Chat Hook Types ──────────────────────────────────────────────────────────

export type ChatStatus = "idle" | "streaming" | "error"

export interface UseChatOptions {
  /** API endpoint for chat requests */
  endpoint: string
  /** Build request body from message and context */
  buildRequest?: (
    message: string,
    context: RequestContext
  ) => Record<string, unknown>
  /** Dynamic headers for requests */
  headers?: () => Record<string, string>
  /** Initial messages */
  initialMessages?: ChatMessage[]
}

export interface UseChatReturn {
  /** Current messages in the conversation */
  messages: ChatMessage[]
  /** Current status of the chat */
  status: ChatStatus
  /** Send a new message */
  sendMessage: (content: string, context?: RequestContext) => Promise<void>
  /** Abort the current streaming request */
  abort: () => void
  /** Clear all messages */
  clearMessages: () => void
  /** Update messages directly */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

// ─── Toolcall Registry Types ──────────────────────────────────────────────────

export interface ToolcallProps {
  name: string
  input: Record<string, unknown>
  toolUseId?: string
}

export interface ToolcallConfig {
  name: string
  component: React.FC<ToolcallProps>
}

export interface ToolResultProps {
  content: string
  toolUseId?: string
  toolName?: string
}

export interface ToolResultConfig {
  name?: string
  component: React.FC<ToolResultProps>
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface ChatMessageProps {
  message: ChatMessage
  className?: string
}

export interface ContentRendererProps {
  item: ContentItem
  className?: string
}

export interface ToolCallRendererProps {
  item: ContentItemToolUse | ContentItemToolResult
  className?: string
}
