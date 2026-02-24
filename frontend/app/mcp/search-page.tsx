"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getMcpCategories,
  McpCategory,
  McpSearchParams,
  McpSearchServerItem,
  PaginatedData,
  searchMcpServers,
} from "@/lib/mcp"
import { cn } from "@/lib/utils"
import {
  CaretLeft,
  CaretRight,
  CloudArrowDown,
  MagnifyingGlass,
} from "@phosphor-icons/react"
import {
  Boxes,
  Cloud,
  FolderOpen,
  MessageSquare,
  Monitor,
  Server,
  Wrench,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

export default function SearchPage() {
  const [categories, setCategories] = useState<McpCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [searchResponse, setSearchResponse] =
    useState<PaginatedData<McpSearchServerItem> | null>(null)
  const [mcpServers, setMcpServers] = useState<McpSearchServerItem[]>([])
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  const pageSize = 12
  const totalServers = searchResponse?.total || 0
  const totalPages = searchResponse?.total_pages || 1

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoryLoading(true)
        const data = await getMcpCategories()
        setCategories(data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      } finally {
        setIsCategoryLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch MCP servers
  const fetchMcpServers = useCallback(
    async (page: number, categoryId: number, keyword: string) => {
      try {
        setIsLoading(true)
        const params: McpSearchParams = {
          page,
          size: pageSize,
          category_id: categoryId,
          keyword,
        }
        const data = await searchMcpServers(params)
        setSearchResponse(data)
        setMcpServers(data.items)
      } catch (err) {
        console.error("Error fetching MCP servers:", err)
        setMcpServers([])
        setSearchResponse(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Initial fetch
  useEffect(() => {
    fetchMcpServers(1, 0, "")
  }, [fetchMcpServers])

  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setCurrentPage(1)
    fetchMcpServers(1, categoryId, searchQuery)
  }

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchMcpServers(1, selectedCategoryId, value)
    }, 400)
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
      setCurrentPage(1)
      fetchMcpServers(1, selectedCategoryId, searchQuery)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchMcpServers(page, selectedCategoryId, searchQuery)
  }

  // Server type label
  const getServerTypeLabel = (type: string) => {
    switch (type) {
      case "hosted":
        return "云服务"
      case "local":
        return "本地服务"
      default:
        return type
    }
  }

  const getServerTypeIcon = (type: string) => {
    switch (type) {
      case "hosted":
        return <Cloud className="h-3.5 w-3.5" />
      case "local":
        return <Monitor className="h-3.5 w-3.5" />
      default:
        return <Server className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 md:flex-row lg:px-8">
      {/* Left Sidebar - Categories (Desktop only) */}
      <aside className="sticky top-[var(--spacing-app-header)] hidden h-[calc(100vh-var(--spacing-app-header))] w-[220px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 md:block">
        <ScrollArea className="h-full">
          <div className="py-3 pr-2">
            {/* All category */}
            <button
              onClick={() => handleCategoryClick(0)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors",
                selectedCategoryId === 0
                  ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Boxes className="h-4 w-4" />
                <span>全部</span>
              </div>
              {totalServers > 0 && selectedCategoryId === 0 && (
                <span className="text-xs text-gray-400">{totalServers}</span>
              )}
            </button>

            {/* Category list */}
            {isCategoryLoading ? (
              <div className="space-y-2 px-4 py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-1 space-y-0.5">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors",
                      selectedCategoryId === category.id
                        ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <span className="truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Right Content */}
      <main className="min-w-0 flex-1">
        <div className="py-3 md:pl-6">
          {/* Mobile Category Tabs */}
          <div className="-mx-4 mb-4 overflow-x-auto px-4 md:hidden">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => handleCategoryClick(0)}
                className={cn(
                  "flex-shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors",
                  selectedCategoryId === 0
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                全部
              </button>
              {isCategoryLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-16 flex-shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800"
                    />
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={cn(
                        "flex-shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors",
                        selectedCategoryId === category.id
                          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                          : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <MagnifyingGlass className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="搜索名称介绍或关键词..."
                className="h-10 rounded-lg border-gray-200 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Link href="/build/mcp">
              <Button variant="outline" className="h-10 gap-2 whitespace-nowrap">
                <CloudArrowDown className="h-4 w-4" />
                <span className="hidden sm:inline">提交 MCP</span>
              </Button>
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[200px] animate-pulse rounded-xl border border-border/50 bg-card p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted/60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-muted/60" />
                    <div className="h-3 w-4/5 rounded bg-muted/60" />
                    <div className="h-3 w-3/5 rounded bg-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Server Cards Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {mcpServers.map((server) => (
                <Link
                  href={`/mcp/${server.owner}/${server.server_name}`}
                  key={`${server.owner}/${server.server_name}`}
                >
                  <div className="group relative flex h-[200px] flex-col rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                    {/* Header: Avatar + Name + Owner */}
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-border/50">
                        <AvatarImage
                          src={server.avatar}
                          alt={server.server_name}
                        />
                        <AvatarFallback className="text-xs font-medium">
                          {server.server_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          title={server.server_name}
                        >
                          {server.server_name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {server.owner}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="mb-auto line-clamp-3 text-sm leading-relaxed text-muted-foreground"
                      title={server.description}
                    >
                      {server.description}
                    </p>

                    {/* Footer: Server Type + Capabilities */}
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="gap-1 text-xs">
                        {getServerTypeIcon(server.server_type)}
                        {getServerTypeLabel(server.server_type)}
                      </Badge>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {server.tools > 0 && (
                          <span className="flex items-center gap-1" title="工具数量">
                            <Wrench className="h-3.5 w-3.5" />
                            {server.tools}
                          </span>
                        )}
                        {server.prompts > 0 && (
                          <span className="flex items-center gap-1" title="提示词数量">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {server.prompts}
                          </span>
                        )}
                        {server.resources > 0 && (
                          <span className="flex items-center gap-1" title="资源数量">
                            <FolderOpen className="h-3.5 w-3.5" />
                            {server.resources}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty state */}
              {mcpServers.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <Server className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    未找到匹配的 MCP 服务器
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                共 {totalServers} 个服务器，第 {currentPage}/{totalPages} 页
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <CaretLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1
                  const shouldShow =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1

                  if (!shouldShow) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="px-1 text-xs text-gray-400"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 text-xs"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <CaretRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
