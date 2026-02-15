"use client"

import { Markdown } from "@/components/prompt-kit/markdown"
import { memo } from "react"
import type { ContentItem } from "../types"
import { ToolCallRenderer } from "./ToolCallRenderer"

// ─── Content Renderer ─────────────────────────────────────────────────────────

export interface ContentRendererProps {
  item: ContentItem
  className?: string
}

export const ContentRenderer = memo(function ContentRenderer({
  item,
  className,
}: ContentRendererProps) {
  if (item.type === "text") {
    return (
      <div className={className}>
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <Markdown>{item.text}</Markdown>
        </div>
      </div>
    )
  }

  if (item.type === "tool_use" || item.type === "tool_result") {
    return <ToolCallRenderer item={item} className={className} />
  }

  return null
})

ContentRenderer.displayName = "ContentRenderer"
