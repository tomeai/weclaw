"use client"

import { getMcpServerRecommend, McpRecommendCategory } from "@/app/lib/mcp"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MagnifyingGlass } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [mcpData, setMcpData] = useState<McpRecommendCategory[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return
    }

    // Navigate to MCP search page with search query
    window.location.href = `/mcp?q=${encodeURIComponent(searchQuery)}`
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  useEffect(() => {
    const fetchMcpRecommend = async () => {
      try {
        setLoading(true)
        const response = await getMcpServerRecommend()
        setMcpData(response)
      } catch (err) {
        console.error("Failed to fetch MCP recommend data:", err)
        setError("获取推荐数据失败，请稍后重试")
      } finally {
        setLoading(false)
      }
    }

    fetchMcpRecommend()
  }, [])

  return (
    <div
      className={cn(
        "@container/main relative flex h-full min-h-screen flex-col items-center justify-start"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 md:py-28 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center md:mb-10">
          <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
            MCP Servers 市场
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            基于多维评分，帮你打造更强大的 AI 系统。
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mx-auto mb-16 w-full max-w-4xl">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <MagnifyingGlass className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="搜索 MCP 服务器..."
            className="h-14 rounded-lg border-gray-200 py-3 pr-4 pl-14 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* mcp recommend section */}
        <div className="mb-16">
          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                重新加载
              </Button>
            </div>
          )}

          {!loading && !error && mcpData && mcpData.length > 0 && (
            <>
              {mcpData.map((category) => (
                <div key={category.id} className="mb-12">
                  {/* Category Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-1.5 rounded-sm bg-blue-500"></div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h2>
                    </div>
                    <Link href={`/mcp?category=${category.id}`}>
                      <Button variant="outline" size="sm">
                        查看所有
                      </Button>
                    </Link>
                  </div>

                  {/* Servers Grid - 2 rows, 4 cards per row */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {category.servers.slice(0, 8).map((server, index) => {
                      // Generate a seed for the avatar based on the server title
                      const avatarSeed = server.server_title
                        .replace(/\s+/g, "-")
                        .toLowerCase()

                      return (
                        <Link href={`/mcp/${server.user.username}/${server.server_name}`} key={`${server.server_name}-${index}`}>
                          <Card className="group h-[200px] w-full border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg">
                            <CardContent className="flex h-full flex-col p-5">
                              <div className="flex h-full flex-col">
                                {/* Header with title and avatar */}
                                <div className="mb-4 flex items-start justify-between">
                                  <div className="flex w-full items-center gap-3 overflow-hidden">
                                    <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100 transition-all group-hover:ring-blue-200">
                                      <AvatarImage
                                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
                                        alt={server.server_title}
                                      />
                                      <AvatarFallback className="bg-gray-100 text-xs font-medium text-gray-700">
                                        {server.server_title
                                          .substring(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex w-full min-w-0 flex-col overflow-hidden">
                                      <div className="flex w-full items-center gap-2 overflow-hidden">
                                        <h3
                                          className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-700"
                                          title={server.server_title}
                                        >
                                          {server.server_title}
                                        </h3>
                                        <Badge
                                          variant={
                                            server.server_type === "hosted"
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="flex-shrink-0 text-xs"
                                        >
                                          {server.server_type}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Description with fixed height and truncation */}
                                <div className="mb-auto">
                                  <p
                                    className="line-clamp-3 text-sm leading-relaxed text-gray-600"
                                    title={server.description}
                                  >
                                    {server.description}
                                  </p>
                                </div>

                                {/* Tools count badge */}
                                <div className="mt-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {server.tools} tools
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading &&
            !error &&
            (!mcpData || mcpData.length === 0) && (
              <div className="py-8 text-center">
                <p className="text-gray-600">暂无推荐数据</p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
