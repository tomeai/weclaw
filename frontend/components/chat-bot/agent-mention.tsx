"use client"

import type { SelectedContext, SearchResult } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { searchAgents, type AgentSearchItem } from "@/lib/agent"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function AgentMentionDropdown({
  open,
  onClose,
  query,
  onQueryChange,
  anchorRef,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  query: string
  onQueryChange: (query: string) => void
  anchorRef: React.RefObject<HTMLElement | null>
  onSelect: (ctx: SelectedContext) => void
}) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose, anchorRef])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [open])

  // Search agents with debounce
  useEffect(() => {
    if (!open) {
      setResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchAgents({ keyword: query, size: 10 })
        const items = res.items.map((s: AgentSearchItem) => ({
          owner: s.owner,
          name: s.name,
          label: s.title || s.name,
          description: s.description,
          avatar: s.avatar,
        }))
        setResults(items)
      } catch {
        // ignore search errors
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, open])

  if (!open) return null

  return (
    <div
      ref={containerRef}
      className="bg-popover absolute right-0 bottom-full left-0 z-50 mb-1 w-[300px] rounded-xl border shadow-lg md:w-[350px]"
    >
      {/* Search Input */}
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="搜索Agent"
          className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation()
              onClose()
            }
          }}
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
          results.map((item, idx) => (
            <button
              key={`${item.owner}/${item.name}/${idx}`}
              onClick={() =>
                onSelect({
                  type: "agent",
                  owner: item.owner,
                  name: item.name,
                  label: item.label,
                })
              }
              className={cn(
                "hover:bg-accent flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
                idx !== results.length - 1 && "border-border/50 border-b"
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
            </button>
          ))}
      </ScrollArea>
    </div>
  )
}
