"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getMcpRecommendList, McpRecommendItem } from "@/lib/mcp"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  Brain,
  Globe,
  Lightning,
  Plugs,
  Robot,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState } from "react"

function formatCallCount(count: number): string {
  if (count >= 10000) {
    return (count / 1000).toFixed(1) + "k"
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(2) + "k"
  }
  return count.toString()
}

function McpCard({ server }: { server: McpRecommendItem }) {
  const avatarSeed = server.server_name.replace(/\s+/g, "-").toLowerCase()

  return (
    <Link href={`/mcp/${server.owner}/${server.server_name}`}>
      <div className="group/card relative flex h-[180px] w-[300px] flex-shrink-0 flex-col rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-border/50">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
              alt={server.server_name}
            />
            <AvatarFallback className="text-xs font-medium">
              {server.server_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400">
              {server.server_name}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {server.owner}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-auto line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {server.description}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {server.server_type === "hosted" ? (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Remote
              </span>
            ) : (
              "Local"
            )}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>{formatCallCount(server.call_count)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ScrollingRow({
  servers,
  direction = "left",
  speed = 30,
}: {
  servers: McpRecommendItem[]
  direction?: "left" | "right"
  speed?: number
}) {
  if (servers.length === 0) return null

  // Ensure enough cards to fill wide viewports
  const minCards = 10
  const repeatCount = Math.max(1, Math.ceil(minCards / servers.length))
  const expandedServers = Array(repeatCount).fill(servers).flat()

  return (
    <div className="group/row relative overflow-hidden py-2">
      {/* Gradient edge masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div
        className={cn(
          "flex gap-4",
          direction === "left"
            ? "animate-scroll-left"
            : "animate-scroll-right",
          "group-hover/row:[animation-play-state:paused]"
        )}
        style={{
          width: "max-content",
          animationDuration: `${speed}s`,
        }}
      >
        {/* Render twice for seamless loop */}
        {expandedServers.map((server, i) => (
          <McpCard key={`a-${i}`} server={server} />
        ))}
        {expandedServers.map((server, i) => (
          <McpCard key={`b-${i}`} server={server} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [servers, setServers] = useState<McpRecommendItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getMcpRecommendList()
        setServers(data)
      } catch (err) {
        console.error("Failed to fetch recommend data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Distribute servers across 3 rows with different orderings
  const row1 = servers
  const row2 = [...servers].reverse()
  const row3 = [
    ...servers.slice(Math.floor(servers.length / 2)),
    ...servers.slice(0, Math.floor(servers.length / 2)),
  ]

  return (
    <div className="@container/main relative flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Top badge */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Robot className="h-4 w-4 text-yellow-500" weight="fill" />
            <span>下一代智能 Agent 构建平台</span>
          </div>

          {/* Title */}
          <p className="animate-fade-in-up mb-3 text-3xl font-medium tracking-wide text-muted-foreground/70 sm:text-4xl [animation-delay:100ms]">
            赋予 Agent 无限能力
          </p>
          <h1 className="animate-fade-in-up mb-8 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl [animation-delay:150ms]">
            <span className="animate-gradient-flow bg-[length:200%_auto] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
              从想法到智能体，一步到位
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl [animation-delay:200ms]">
            MCP 工具 + Skill 编排，打造能理解、会行动的 AI Agent
          </p>

          {/* Feature highlights */}
          <div className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-8 [animation-delay:300ms]">
            <div className="flex items-center gap-2">
              <Plugs className="h-4 w-4" />
              <span>MCP 工具生态</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <Lightning className="h-4 w-4" />
              <span>可复用 Skill</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>一键构建 Agent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Cards Section */}
      <section className="relative pb-24">
        <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-foreground">
            热门推荐
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
          </div>
        ) : servers.length > 0 ? (
          <div className="space-y-2">
            <ScrollingRow servers={row1} direction="left" speed={35} />
            <ScrollingRow servers={row2} direction="right" speed={40} />
            <ScrollingRow servers={row3} direction="left" speed={30} />
          </div>
        ) : null}
      </section>
    </div>
  )
}
