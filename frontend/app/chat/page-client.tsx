"use client"

import { ChatContainer } from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { Markdown } from "@/components/prompt-kit/markdown"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { searchAgents, type AgentSearchItem } from "@/lib/agent"
import { searchMcpServers, type McpSearchServerItem } from "@/lib/mcp"
import { API_ROUTE_AGENT_CHAT } from "@/lib/routes"
import { searchSkills, type SkillSearchItem } from "@/lib/skill"
import { cn } from "@/lib/utils"
import {
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronRight,
  Mic,
  Plus,
  Search,
  Server,
  Sparkles,
  Wrench,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

// ─── SSE Types ────────────────────────────────────────────────────────────────

type ContentItemText = { type: "text"; text: string }
type ContentItemToolUse = {
  type: "tool_use"
  id: string
  name: string
  input: Record<string, unknown>
}
type ContentItemToolResult = {
  type: "tool_result"
  tool_use_id: string
  content: string
}

type ContentItem = ContentItemText | ContentItemToolUse | ContentItemToolResult

type SSEEvent = {
  id: string
  type: "content_block_delta"
  content: ContentItem
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: ContentItem[]
  isStreaming?: boolean
}

// ─── Props ────────────────────────────────────────────────────────────────────

type ChatClientProps = {
  type?: string
  owner?: string
  name?: string
}

type SelectedContext = {
  type: "mcp" | "skill" | "agent"
  owner: string
  name: string
  label: string
}

type SearchType = "mcp" | "skill" | "agent"

type SearchResult = {
  owner: string
  name: string
  label: string
  description: string
}

// ─── Search Popover ──────────────────────────────────────────────────────────

const SEARCH_CONFIG: Record<
  SearchType,
  {
    placeholder: string
    icon: React.ReactNode
    itemIcon: React.ReactNode
  }
> = {
  mcp: {
    placeholder: "搜索MCP",
    icon: <Server className="h-4 w-4" />,
    itemIcon: <Server className="h-4 w-4 text-muted-foreground" />,
  },
  skill: {
    placeholder: "搜索技能",
    icon: <Sparkles className="h-4 w-4" />,
    itemIcon: <Sparkles className="h-4 w-4 text-muted-foreground" />,
  },
  agent: {
    placeholder: "搜索Agent",
    icon: <Bot className="h-4 w-4" />,
    itemIcon: <Bot className="h-4 w-4 text-muted-foreground" />,
  },
}

function SearchPopover({
  open,
  onOpenChange,
  searchType,
  onSelect,
  tooltip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchType: SearchType
  onSelect: (ctx: SelectedContext) => void
  tooltip: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const config = SEARCH_CONFIG[searchType]
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        let items: SearchResult[] = []
        if (searchType === "mcp") {
          const res = await searchMcpServers({ keyword: query, size: 10 })
          items = res.items.map((s: McpSearchServerItem) => ({
            owner: s.owner,
            name: s.server_name,
            label: s.server_name,
            description: s.description,
          }))
        } else if (searchType === "skill") {
          const res = await searchSkills({ keyword: query, size: 10 })
          items = res.items.map((s: SkillSearchItem) => ({
            owner: s.owner,
            name: s.name,
            label: s.name,
            description: s.description,
          }))
        } else {
          const res = await searchAgents({ keyword: query, size: 10 })
          items = res.items.map((s: AgentSearchItem) => ({
            owner: s.owner,
            name: s.name,
            label: s.title || s.name,
            description: s.description,
          }))
        }
        setResults(items)
      } catch {
        // ignore search errors
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, open, searchType])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              {config.icon}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[300px] rounded-xl p-0"
        align="start"
        sideOffset={8}
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.placeholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[360px]">
          {loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              搜索中...
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              未找到结果
            </div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              输入关键词搜索
            </div>
          )}

          {!loading &&
            results.map((item, idx) => (
              <button
                key={`${item.owner}/${item.name}/${idx}`}
                onClick={() => {
                  onSelect({
                    type: searchType,
                    owner: item.owner,
                    name: item.name,
                    label: item.label,
                  })
                  onOpenChange(false)
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-accent",
                  idx !== results.length - 1 && "border-b border-border/50"
                )}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {config.itemIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                    >
                      {item.owner}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.description || "暂无描述"}
                  </p>
                </div>
              </button>
            ))}
        </ScrollArea>

      </PopoverContent>
    </Popover>
  )
}

// ─── Suggestion Pills ─────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  { label: "开发应用", icon: "🛠️" },
  { label: "数据分析", icon: "📊" },
  { label: "设计", icon: "🎨" },
  { label: "更多", icon: null },
]

// ─── Input Bar (shared between welcome & conversation) ──────────────────────

function ChatInputBar({
  input,
  setInput,
  isStreaming,
  sendMessage,
  selectedContext,
  setSelectedContext,
  mcpOpen,
  setMcpOpen,
  skillOpen,
  setSkillOpen,
  agentOpen,
  setAgentOpen,
}: {
  input: string
  setInput: (v: string) => void
  isStreaming: boolean
  sendMessage: () => void
  selectedContext: SelectedContext | null
  setSelectedContext: (v: SelectedContext | null) => void
  mcpOpen: boolean
  setMcpOpen: (v: boolean) => void
  skillOpen: boolean
  setSkillOpen: (v: boolean) => void
  agentOpen: boolean
  setAgentOpen: (v: boolean) => void
}) {
  return (
    <PromptInput
      value={input}
      onValueChange={setInput}
      onSubmit={sendMessage}
      isLoading={isStreaming}
    >
      {selectedContext && (
        <div className="flex items-center gap-1 px-3 pt-2">
          <Badge variant="secondary" className="gap-1 pr-1">
            @{selectedContext.label}
            <button
              onClick={() => setSelectedContext(null)}
              className="ml-0.5 rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
      <PromptInputTextarea placeholder="分配一个任务或提问任何问题" rows={4} className="min-h-[100px]" />
      <PromptInputActions className="justify-between">
        <div className="flex items-center gap-1">
          <PromptInputAction tooltip="添加">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PromptInputAction>
          <SearchPopover
            open={mcpOpen}
            onOpenChange={setMcpOpen}
            searchType="mcp"
            onSelect={setSelectedContext}
            tooltip="MCP"
          />
          <SearchPopover
            open={skillOpen}
            onOpenChange={setSkillOpen}
            searchType="skill"
            onSelect={setSelectedContext}
            tooltip="Skill"
          />
          <SearchPopover
            open={agentOpen}
            onOpenChange={setAgentOpen}
            searchType="agent"
            onSelect={setSelectedContext}
            tooltip="Agent"
          />
        </div>
        <div className="flex items-center gap-1">
          <PromptInputAction tooltip="语音">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction tooltip="发送">
            <Button
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </PromptInputAction>
        </div>
      </PromptInputActions>
    </PromptInput>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatClient({ type, owner, name }: ChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const [selectedContext, setSelectedContext] =
    useState<SelectedContext | null>(null)
  const [mcpOpen, setMcpOpen] = useState(false)
  const [skillOpen, setSkillOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

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
    setInput("")
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const token = localStorage.getItem("auth_token")
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

      const res = await fetch(`${baseUrl}${API_ROUTE_AGENT_CHAT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: selectedContext?.type ?? type,
          owner: selectedContext?.owner ?? owner,
          name: selectedContext?.name ?? name,
          message: trimmed,
        }),
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
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [input, isStreaming, type, owner, name, selectedContext])

  const hasMessages = messages.length > 0

  const inputBarProps = {
    input,
    setInput,
    isStreaming,
    sendMessage,
    selectedContext,
    setSelectedContext,
    mcpOpen,
    setMcpOpen,
    skillOpen,
    setSkillOpen,
    agentOpen,
    setAgentOpen,
  }

  // ─── Welcome View ─────────────────────────────────────────────────────────

  if (!hasMessages) {
    return (
      <div className="pt-app-header flex flex-1 flex-col items-center justify-center px-4">
        <h1 className="mb-8 text-2xl font-semibold">今天可以帮你做什么？</h1>
        <div className="w-full max-w-2xl">
          <ChatInputBar {...inputBarProps} />

          {/* Quick suggestion pills */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setInput(s.label)}
              >
                {s.icon && <span className="text-sm">{s.icon}</span>}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Conversation View ────────────────────────────────────────────────────

  return (
    <div className="pt-app-header flex flex-1 flex-col overflow-hidden">
      <ChatContainer className="flex-1 px-4 py-6" autoScroll>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </ChatContainer>

      <div className="border-t px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <ChatInputBar {...inputBarProps} />
        </div>
      </div>
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    const text = message.content
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
  }

  return (
    <div className="mb-4 flex items-start gap-3">
      <Avatar className="mt-1 h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[75%] space-y-2">
        {message.content.map((item, i) => (
          <ContentBlock key={`${message.id}-${i}`} item={item} />
        ))}
        {message.isStreaming && message.content.length === 0 && (
          <Loader text="思考中" size="sm" />
        )}
      </div>
    </div>
  )
}

// ─── Content Block ────────────────────────────────────────────────────────────

function ContentBlock({ item }: { item: ContentItem }) {
  if (item.type === "text") {
    return (
      <div className="prose dark:prose-invert prose-sm max-w-none">
        <Markdown>{item.text}</Markdown>
      </div>
    )
  }

  if (item.type === "tool_use") {
    return <ToolUseCard name={item.name} input={item.input} />
  }

  if (item.type === "tool_result") {
    return <ToolResultCard content={item.content} />
  }

  return null
}

// ─── Tool Use Card ────────────────────────────────────────────────────────────

function ToolUseCard({
  name,
  input,
}: {
  name: string
  input: Record<string, unknown>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-border bg-muted/50 overflow-hidden rounded-lg border">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
        onClick={() => setOpen(!open)}
      >
        <Wrench className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-muted-foreground flex-1 truncate font-medium">
          调用工具: {name}
        </span>
        {open ? (
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="border-t px-3 py-2">
          <pre className="text-muted-foreground overflow-x-auto text-xs">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Tool Result Card ─────────────────────────────────────────────────────────

function ToolResultCard({ content }: { content: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-border bg-muted/50 overflow-hidden rounded-lg border">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
        onClick={() => setOpen(!open)}
      >
        <ChevronRight
          className={cn(
            "text-muted-foreground h-3.5 w-3.5 flex-shrink-0 transition-transform",
            open && "rotate-90"
          )}
        />
        <span className="text-muted-foreground flex-1 font-medium">
          工具结果
        </span>
      </button>
      {open && (
        <div className="border-t px-3 py-2">
          <pre className="text-muted-foreground overflow-x-auto whitespace-pre-wrap text-xs">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}
