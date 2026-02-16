"use client"

import type { SelectedContext } from "./types"
import { AgentMentionDropdown } from "./agent-mention"
import { SearchPopover } from "./search-popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowUp, Paperclip, Server, Sparkles, Square, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"

interface CustomInputProps {
  inProgress: boolean
  onSend: (text: string) => void
  onStop?: () => void
  chatReady?: boolean
  // Context selection state (passed from ChatBot)
  selectedAgent: SelectedContext | null
  setSelectedAgent: (v: SelectedContext | null) => void
  selectedMcps: SelectedContext[]
  selectedSkills: SelectedContext[]
  onToggleMcp: (ctx: SelectedContext) => void
  onToggleSkill: (ctx: SelectedContext) => void
  onRemoveMcp: (ctx: SelectedContext) => void
  onRemoveSkill: (ctx: SelectedContext) => void
  mcpOpen: boolean
  setMcpOpen: (v: boolean) => void
  skillOpen: boolean
  setSkillOpen: (v: boolean) => void
}

export function CustomInput({
  inProgress,
  onSend,
  onStop,
  chatReady = false,
  selectedAgent,
  setSelectedAgent,
  selectedMcps,
  selectedSkills,
  onToggleMcp,
  onToggleSkill,
  onRemoveMcp,
  onRemoveSkill,
  mcpOpen,
  setMcpOpen,
  skillOpen,
  setSkillOpen,
}: CustomInputProps) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Agent mention state
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [atPosition, setAtPosition] = useState(-1)

  const handleInputChange = useCallback(
    (value: string) => {
      setText(value)

      const atMatch = value.match(/(^|\s|\n)@([^\s\n]*)$/)
      if (atMatch) {
        setAtPosition(atMatch.index! + atMatch[1].length)
        setMentionQuery(atMatch[2])
        setMentionOpen(true)
      } else {
        setMentionOpen(false)
        setMentionQuery("")
        setAtPosition(-1)
      }
    },
    []
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && mentionOpen) {
        e.preventDefault()
        setMentionOpen(false)
        setMentionQuery("")
        setAtPosition(-1)
        return
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!inProgress && text.trim()) {
          onSend(text)
          setText("")
        }
      }
    },
    [mentionOpen, inProgress, text, onSend]
  )

  const handleAgentSelect = useCallback(
    (ctx: SelectedContext) => {
      if (atPosition >= 0) {
        const newValue =
          text.slice(0, atPosition) +
          text.slice(atPosition + 1 + mentionQuery.length)
        setText(newValue)
      }
      setSelectedAgent(ctx)
      setMentionOpen(false)
      setMentionQuery("")
      setAtPosition(-1)
      setTimeout(() => textareaRef.current?.focus(), 0)
    },
    [atPosition, text, mentionQuery, setSelectedAgent]
  )

  const handleSearchQueryChange = useCallback(
    (newQuery: string) => {
      setMentionQuery(newQuery)
      if (atPosition >= 0) {
        const newValue = text.slice(0, atPosition + 1) + newQuery
        setText(newValue)
      }
    },
    [atPosition, text]
  )

  const send = () => {
    if (inProgress || !text.trim()) return
    onSend(text)
    setText("")
    textareaRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative border-t px-4 py-3">
      <div className="mx-auto max-w-2xl">
        <div className="bg-muted/50 rounded-xl border">
          {/* Textarea row */}
          <div className="flex items-start">
            {selectedAgent && (
              <Badge
                variant="secondary"
                className="mt-[9px] ml-3 shrink-0 gap-1 pr-1 text-sm"
              >
                @{selectedAgent.label}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="hover:bg-muted ml-0.5 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入 @ 选择Agent，分配任务或提问"
              rows={4}
              className={cn(
                "min-h-[100px] w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none",
                selectedAgent && "pl-1.5"
              )}
            />
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex flex-wrap items-center gap-1">
              {/* Attachment button */}
              <button className="hover:bg-accent h-8 w-8 rounded-full flex items-center justify-center">
                <Paperclip className="h-4 w-4" />
              </button>

              {/* MCP group */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  selectedMcps.length > 0 &&
                    "border-border/60 rounded-full border py-0.5 pr-1.5 pl-0.5"
                )}
              >
                <SearchPopover
                  open={mcpOpen}
                  onOpenChange={setMcpOpen}
                  searchType="mcp"
                  onToggle={onToggleMcp}
                  selectedItems={selectedMcps}
                  tooltip="MCP"
                />
                {selectedMcps.map((ctx) => (
                  <Badge
                    key={`${ctx.owner}/${ctx.name}`}
                    variant="secondary"
                    className="max-w-[120px] gap-1 pr-1 text-xs"
                  >
                    <span className="truncate">{ctx.label}</span>
                    <button
                      onClick={() => onRemoveMcp(ctx)}
                      className="hover:bg-muted ml-0.5 shrink-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Skill group */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  selectedSkills.length > 0 &&
                    "border-border/60 rounded-full border py-0.5 pr-1.5 pl-0.5"
                )}
              >
                <SearchPopover
                  open={skillOpen}
                  onOpenChange={setSkillOpen}
                  searchType="skill"
                  onToggle={onToggleSkill}
                  selectedItems={selectedSkills}
                  tooltip="Skill"
                />
                {selectedSkills.map((ctx) => (
                  <Badge
                    key={`${ctx.owner}/${ctx.name}`}
                    variant="secondary"
                    className="max-w-[120px] gap-1 pr-1 text-xs"
                  >
                    <span className="truncate">{ctx.label}</span>
                    <button
                      onClick={() => onRemoveSkill(ctx)}
                      className="hover:bg-muted ml-0.5 shrink-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Send / Stop button */}
            <div className="flex items-center gap-1">
              {inProgress ? (
                <button
                  onClick={onStop}
                  className="bg-foreground text-background flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={send}
                  disabled={!text.trim()}
                  className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Agent mention dropdown */}
        <AgentMentionDropdown
          open={mentionOpen}
          onClose={() => {
            setMentionOpen(false)
            setMentionQuery("")
            setAtPosition(-1)
          }}
          query={mentionQuery}
          onQueryChange={handleSearchQueryChange}
          anchorRef={containerRef}
          onSelect={handleAgentSelect}
        />
      </div>
    </div>
  )
}
