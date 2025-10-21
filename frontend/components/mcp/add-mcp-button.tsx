"use client"

import { Button } from "@/components/ui/button"
import { Plus, Server } from "lucide-react"
import Link from "next/link"

interface AddMcpButtonProps {
  className?: string
  variant?: "dialog" | "link"
}

export function AddMcpButton({ className, variant = "link" }: AddMcpButtonProps) {
  // 为了避免可能的循环依赖和性能问题，暂时只使用 link 模式
  // 如果需要对话框模式，可以创建一个单独的组件
  return (
    <Link href="/mcp/submit">
      <Button 
        variant="outline" 
        size="sm" 
        className={`gap-2 ${className}`}
      >
        <Server className="h-4 w-4" />
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">添加MCP</span>
      </Button>
    </Link>
  )
}
