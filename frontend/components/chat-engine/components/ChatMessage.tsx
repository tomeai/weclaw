"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader } from "@/components/prompt-kit/loader"
import { Bot } from "lucide-react"
import { memo } from "react"
import type { ChatMessage as ChatMessageType, ContentItemText } from "../types"
import { ContentRenderer } from "./ContentRenderer"

// ─── User Message Bubble ─────────────────────────────────────────────────────

interface UserMessageBubbleProps {
  content: ChatMessageType["content"]
}

const UserMessageBubble = memo(function UserMessageBubble({
  content,
}: UserMessageBubbleProps) {
  const text = content
    .filter((c): c is ContentItemText => c.type === "text")
    .map((c) => c.text)
    .join("")

  return (
    <div className="mb-4 flex justify-end">
      <div className="bg-primary text-primary-foreground max-w-[75%] rounded-2xl px-4 py-2">
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
})

// ─── Assistant Message Bubble ────────────────────────────────────────────────

interface AssistantMessageBubbleProps {
  message: ChatMessageType
}

const AssistantMessageBubble = memo(function AssistantMessageBubble({
  message,
}: AssistantMessageBubbleProps) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <Avatar className="mt-1 h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[75%] space-y-2">
        {message.content.map((item, i) => (
          <ContentRenderer
            key={`${message.id}-${i}`}
            item={item}
          />
        ))}
        {message.isStreaming && message.content.length === 0 && (
          <Loader text="思考中" size="sm" />
        )}
      </div>
    </div>
  )
})

// ─── Main ChatMessage Component ───────────────────────────────────────────────

export interface ChatMessageProps {
  message: ChatMessageType
  className?: string
}

export const ChatMessage = memo(function ChatMessage({
  message,
  className,
}: ChatMessageProps) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className={className}>
        <UserMessageBubble content={message.content} />
      </div>
    )
  }

  return (
    <div className={className}>
      <AssistantMessageBubble message={message} />
    </div>
  )
})

ChatMessage.displayName = "ChatMessage"
