"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AgentCategory,
  AgentSearchItem,
  AgentSearchParams,
  getAgentCategories,
  searchAgents,
} from "@/lib/agent"
import { PaginatedData } from "@/lib/mcp"
import { cn } from "@/lib/utils"
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Robot,
} from "@phosphor-icons/react"
import {
  BookOpen,
  Boxes,
  BrainCircuit,
  Database,
  Wrench,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

export default function SearchPage() {
  const [categories, setCategories] = useState<AgentCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [searchResponse, setSearchResponse] =
    useState<PaginatedData<AgentSearchItem> | null>(null)
  const [agents, setAgents] = useState<AgentSearchItem[]>([])
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  const pageSize = 12
  const totalAgents = searchResponse?.total || 0
  const totalPages = searchResponse?.total_pages || 1

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoryLoading(true)
        const data = await getAgentCategories()
        setCategories(data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      } finally {
        setIsCategoryLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch agents
  const fetchAgents = useCallback(
    async (page: number, categoryId: number, keyword: string) => {
      try {
        setIsLoading(true)
        const params: AgentSearchParams = {
          page,
          size: pageSize,
          category_id: categoryId,
          keyword,
        }
        const data = await searchAgents(params)
        setSearchResponse(data)
        setAgents(data.items)
      } catch (err) {
        console.error("Error fetching agents:", err)
        setAgents([])
        setSearchResponse(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Initial fetch
  useEffect(() => {
    fetchAgents(1, 0, "")
  }, [fetchAgents])

  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setCurrentPage(1)
    fetchAgents(1, categoryId, searchQuery)
  }

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchAgents(1, selectedCategoryId, value)
    }, 400)
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
      setCurrentPage(1)
      fetchAgents(1, selectedCategoryId, searchQuery)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAgents(page, selectedCategoryId, searchQuery)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Sidebar - Categories */}
      <aside className="sticky top-[var(--spacing-app-header)] h-[calc(100vh-var(--spacing-app-header))] w-[220px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
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
              {totalAgents > 0 && selectedCategoryId === 0 && (
                <span className="text-xs text-gray-400">{totalAgents}</span>
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
        <div className="py-3 pl-6">
          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <MagnifyingGlass className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="搜索智能体名称或关键词..."
                className="h-10 rounded-lg border-gray-200 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Link href="/build/agent">
              <Button variant="outline" className="h-10 gap-2 whitespace-nowrap">
                <Robot className="h-4 w-4" />
                创建 Agent
              </Button>
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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

          {/* Agent Cards Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent, index) => (
                <Link
                  href={`/agent/${index}`}
                  key={`${agent.owner}-${agent.title}-${index}`}
                >
                  <div className="group relative flex h-[200px] flex-col rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                    {/* Header: Avatar + Name + Owner */}
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-border/50">
                        <AvatarImage
                          src={agent.avatar}
                          alt={agent.title}
                        />
                        <AvatarFallback className="text-xs font-medium">
                          {agent.title.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          title={agent.title}
                        >
                          {agent.title}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {agent.owner}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="mb-auto line-clamp-3 text-sm leading-relaxed text-muted-foreground"
                      title={agent.description || ""}
                    >
                      {agent.description}
                    </p>

                    {/* Footer: Capabilities */}
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <BrainCircuit className="h-3.5 w-3.5" />
                        Agent
                      </Badge>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {agent.tools > 0 && (
                          <span className="flex items-center gap-1" title="工具数量">
                            <Wrench className="h-3.5 w-3.5" />
                            {agent.tools}
                          </span>
                        )}
                        {agent.skills > 0 && (
                          <span className="flex items-center gap-1" title="技能数量">
                            <BrainCircuit className="h-3.5 w-3.5" />
                            {agent.skills}
                          </span>
                        )}
                        {agent.knowledge > 0 && (
                          <span className="flex items-center gap-1" title="知识库数量">
                            <BookOpen className="h-3.5 w-3.5" />
                            {agent.knowledge}
                          </span>
                        )}
                        {agent.databases > 0 && (
                          <span className="flex items-center gap-1" title="数据库数量">
                            <Database className="h-3.5 w-3.5" />
                            {agent.databases}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty state */}
              {agents.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <Robot className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    未找到匹配的智能体
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                共 {totalAgents} 个智能体，第 {currentPage}/{totalPages} 页
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
