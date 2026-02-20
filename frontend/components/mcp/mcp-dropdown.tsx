"use client";

import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bot, ChevronDown, Server, Sparkles } from "lucide-react";
import Link from "next/link";


interface McpDropdownProps {
  className?: string
}

export function McpDropdown({ className }: McpDropdownProps) {
  const { user, isJwtAuthenticated } = useUser()
  const isLoggedIn = !!user || isJwtAuthenticated

  const handleAddMcpClick = () => {
    if (!isLoggedIn) {
      window.location.href = "/auth/login"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">构建</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href="/build/mcp"
            className="flex cursor-pointer items-center gap-2"
          >
            <Server className="h-4 w-4" />
            创建MCP
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/build/skill"
            className="flex cursor-pointer items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            创建Skill
          </Link>
        </DropdownMenuItem>
        {/*<DropdownMenuSeparator />*/}
        {/*<DropdownMenuItem asChild>*/}
        {/*  <Link*/}
        {/*    href="/build/agent"*/}
        {/*    className="flex cursor-pointer items-center gap-2"*/}
        {/*  >*/}
        {/*    <Bot className="h-4 w-4" />*/}
        {/*    创建Agent*/}
        {/*  </Link>*/}
        {/*</DropdownMenuItem>*/}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
