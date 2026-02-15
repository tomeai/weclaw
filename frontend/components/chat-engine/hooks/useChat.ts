"use client"

import { useCallback, useRef, useState } from "react"
import type {
  ChatMessage,
  ChatStatus,
  ContentItem,
  RequestContext,
  SSEEvent,
  UseChatOptions,
  UseChatReturn,
} from "../types"

// ─── Default Request Builder ─────────────────────────────────────────────────

const defaultBuildRequest = (
  message: string,
  context: RequestContext
): Record<string, unknown> => {
  return {
    type: context.agent?.type,
    owner: context.agent?.owner,
    name: context.agent?.name,
    message,
    ...(context.mcps.length > 0 && {
      mcps: context.mcps.map((m) => ({
        owner: m.owner,
        name: m.name,
      })),
    }),
    ...(context.skills.length > 0 && {
      skills: context.skills.map((s) => ({
        owner: s.owner,
        name: s.name,
      })),
    }),
  }
}

// ─── useChat Hook ────────────────────────────────────────────────────────────

export function useChat({
  endpoint,
  buildRequest = defaultBuildRequest,
  headers,
  initialMessages = [],
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [status, setStatus] = useState<ChatStatus>("idle")
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string, context: RequestContext = { mcps: [], skills: [] }) => {
      const trimmed = content.trim()
      if (!trimmed || status === "streaming") return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: [{ type: "text", text: trimmed }],
      }

      const assistantId = crypto.randomUUID()
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: [],
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStatus("streaming")

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const dynamicHeaders = headers?.() || {}
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...dynamicHeaders,
          },
          body: JSON.stringify(buildRequest(trimmed, context)),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        const seenIds = new Map<string, ContentItem>()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.startsWith("data:")) continue
            const data = line.slice(5).trim()
            if (!data || data === "[DONE]") continue

            try {
              const event: SSEEvent = JSON.parse(data)
              seenIds.set(event.id, event.content)

              const contentArr = Array.from(seenIds.values())
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: contentArr } : m
                )
              )
            } catch {
              // skip malformed JSON lines
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStatus("error")
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: [
                      ...m.content,
                      {
                        type: "text" as const,
                        text: "请求失败，请重试。",
                      },
                    ],
                  }
                : m
            )
          )
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        )
        setStatus("idle")
        abortRef.current = null
      }
    },
    [endpoint, buildRequest, headers, status]
  )

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStatus("idle")
  }, [])

  return {
    messages,
    status,
    sendMessage,
    abort,
    clearMessages,
    setMessages,
  }
}
