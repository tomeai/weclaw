"use client"

import type { SearchType, SelectedContext, SearchResult } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { searchSkills, type SkillSearchItem } from "@/lib/skill"
import { cn } from "@/lib/utils"
import { Bot, Check, Search, Server, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const SEARCH_CONFIG: Record<
  SearchType,
  {
    placeholder: string
    icon: React.ReactNode
  }
> = {
  mcp: {
    placeholder: "搜索MCP",
    icon: <Server className="h-4 w-4" />,
  },
  skill: {
    placeholder: "搜索技能",
    icon: <Sparkles className="h-4 w-4" />,
  },
  agent: {
    placeholder: "搜索Agent",
    icon: <Bot className="h-4 w-4" />,
  },
}

export function SearchPopover({
  open,
  onOpenChange,
  searchType,
  onToggle,
  selectedItems,
  tooltip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchType: SearchType
  onToggle: (ctx: SelectedContext) => void
  selectedItems: SelectedContext[]
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
            avatar: s.avatar,
          }))
        } else if (searchType === "skill") {
          const res = await searchSkills({ keyword: query, size: 10 })
          items = res.items.map((s: SkillSearchItem) => ({
            owner: s.owner,
            name: s.name,
            label: s.name,
            description: s.description,
            avatar: s.avatar,
          }))
        } else {
          const res = await searchAgents({ keyword: query, size: 10 })
          items = res.items.map((s: AgentSearchItem) => ({
            owner: s.owner,
            name: s.name,
            label: s.title || s.name,
            description: s.description,
            avatar: s.avatar,
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
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.placeholder}
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[360px]">
          {loading && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              搜索中...
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              未找到结果
            </div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              输入关键词搜索
            </div>
          )}

          {!loading &&
            results.map((item, idx) => {
              const isSelected = selectedItems.some(
                (s) => s.owner === item.owner && s.name === item.name
              )
              return (
                <button
                  key={`${item.owner}/${item.name}/${idx}`}
                  onClick={() => {
                    onToggle({
                      type: searchType,
                      owner: item.owner,
                      name: item.name,
                      label: item.label,
                    })
                  }}
                  className={cn(
                    "hover:bg-accent flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
                    idx !== results.length - 1 && "border-border/50 border-b",
                    isSelected && "bg-accent/50"
                  )}
                >
                  <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                    <AvatarImage src={item.avatar} alt={item.label} />
                    <AvatarFallback className="text-xs font-medium">
                      {item.label.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      <Badge
                        variant="secondary"
                        className="text-muted-foreground px-1.5 py-0 text-[10px] font-normal"
                      >
                        {item.owner}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {item.description || "暂无描述"}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                  )}
                </button>
              )
            })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
