"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Wrench } from "lucide-react"
import { memo, useState } from "react"
import { useToolComponent, useResultComponent } from "../registry/toolcall-registry"
import type { ContentItemToolResult, ContentItemToolUse, ToolcallProps, ToolResultProps } from "../types"

// ─── Default Tool Use Card ────────────────────────────────────────────────────

const DefaultToolUseCard = memo(function DefaultToolUseCard({
  name,
  input,
}: ToolcallProps) {
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
})

DefaultToolUseCard.displayName = "DefaultToolUseCard"

// ─── Default Tool Result Card ─────────────────────────────────────────────────

const DefaultToolResultCard = memo(function DefaultToolResultCard({
  content,
}: ToolResultProps) {
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
})

DefaultToolResultCard.displayName = "DefaultToolResultCard"

// ─── Tool Use Renderer ────────────────────────────────────────────────────────

interface ToolUseRendererProps {
  item: ContentItemToolUse
  className?: string
}

const ToolUseRenderer = memo(function ToolUseRenderer({
  item,
  className,
}: ToolUseRendererProps) {
  const ToolComponent = useToolComponent(item.name)

  if (ToolComponent) {
    return (
      <div className={className}>
        <ToolComponent
          name={item.name}
          input={item.input}
          toolUseId={item.id}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <DefaultToolUseCard
        name={item.name}
        input={item.input}
        toolUseId={item.id}
      />
    </div>
  )
})

ToolUseRenderer.displayName = "ToolUseRenderer"

// ─── Tool Result Renderer ─────────────────────────────────────────────────────

interface ToolResultRendererProps {
  item: ContentItemToolResult
  className?: string
}

const ToolResultRenderer = memo(function ToolResultRenderer({
  item,
  className,
}: ToolResultRendererProps) {
  const ResultComponent = useResultComponent()

  if (ResultComponent) {
    return (
      <div className={className}>
        <ResultComponent
          content={item.content}
          toolUseId={item.tool_use_id}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <DefaultToolResultCard
        content={item.content}
        toolUseId={item.tool_use_id}
      />
    </div>
  )
})

ToolResultRenderer.displayName = "ToolResultRenderer"

// ─── Main ToolCall Renderer ───────────────────────────────────────────────────

export interface ToolCallRendererProps {
  item: ContentItemToolUse | ContentItemToolResult
  className?: string
}

export const ToolCallRenderer = memo(function ToolCallRenderer({
  item,
  className,
}: ToolCallRendererProps) {
  if (item.type === "tool_use") {
    return <ToolUseRenderer item={item} className={className} />
  }

  if (item.type === "tool_result") {
    return <ToolResultRenderer item={item} className={className} />
  }

  return null
})

ToolCallRenderer.displayName = "ToolCallRenderer"
