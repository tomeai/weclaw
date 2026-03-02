"use client";

import { useUser } from "@/components/providers/user-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMcpCategories, getMyMcps, McpCategory, McpSearchParams, McpSearchServerItem, MyMcpItem, PaginatedData, searchMcpServers } from "@/lib/mcp";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight, CloudArrowDown, MagnifyingGlass } from "@phosphor-icons/react";
import { Cloud, FolderOpen, Globe, MessageSquare, Monitor, Server, User, Wrench } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";


type ActiveTab = "community" | "mine"

export default function SearchPage() {
  const { isJwtAuthenticated } = useUser()
  const [activeTab, setActiveTab] = useState<ActiveTab>("community")

  // Community tab state
  const [categories, setCategories] = useState<McpCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResponse, setSearchResponse] =
    useState<PaginatedData<McpSearchServerItem> | null>(null)
  const [mcpServers, setMcpServers] = useState<McpSearchServerItem[]>([])
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Mine tab state
  const [myMcpPage, setMyMcpPage] = useState(1)
  const [isMyMcpLoading, setIsMyMcpLoading] = useState(false)
  const [myMcpResponse, setMyMcpResponse] =
    useState<PaginatedData<MyMcpItem> | null>(null)
  const [myMcps, setMyMcps] = useState<MyMcpItem[]>([])

  const pageSize = 12
  const totalServers = searchResponse?.total || 0
  const totalPages = searchResponse?.total_pages || 1
  const myTotalPages = myMcpResponse?.total_pages || 1

  // Fetch community MCP servers
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

  // Fetch my MCP servers
  const fetchMyMcps = useCallback(async (page: number) => {
    try {
      setIsMyMcpLoading(true)
      const data = await getMyMcps({ page, size: pageSize })
      setMyMcpResponse(data)
      setMyMcps(data.items)
    } catch (err) {
      console.error("Error fetching my MCPs:", err)
      setMyMcps([])
      setMyMcpResponse(null)
    } finally {
      setIsMyMcpLoading(false)
    }
  }, [])

  // Fetch categories and auto-select first
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoryLoading(true)
        const data = await getMcpCategories()
        setCategories(data)
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id)
          fetchMcpServers(1, data[0].id, "")
        } else {
          fetchMcpServers(1, 0, "")
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        fetchMcpServers(1, 0, "")
      } finally {
        setIsCategoryLoading(false)
      }
    }
    fetchCategories()
  }, [fetchMcpServers])

  // Fetch mine when switching to mine tab
  useEffect(() => {
    if (activeTab === "mine" && isJwtAuthenticated) {
      fetchMyMcps(myMcpPage)
    }
  }, [activeTab, isJwtAuthenticated])

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setCurrentPage(1)
    fetchMcpServers(1, categoryId, searchQuery)
  }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
      setCurrentPage(1)
      fetchMcpServers(1, selectedCategoryId, searchQuery)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchMcpServers(page, selectedCategoryId, searchQuery)
  }

  const handleMyMcpPageChange = (page: number) => {
    setMyMcpPage(page)
    fetchMyMcps(page)
  }

  const getServerTypeLabel = (type: string) => {
    switch (type) {
      case "hosted": return "云服务"
      case "local": return "本地服务"
      default: return type
    }
  }

  const getServerTypeIcon = (type: string) => {
    switch (type) {
      case "hosted": return <Cloud className="h-3.5 w-3.5" />
      case "local": return <Monitor className="h-3.5 w-3.5" />
      default: return <Server className="h-3.5 w-3.5" />
    }
  }

  const renderPagination = (
    currentPg: number,
    totalPgs: number,
    total: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPgs <= 1) return null
    return (
      <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          共 {total} 个服务器，第 {currentPg}/{totalPgs} 页
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPg === 1}
            onClick={() => onPageChange(currentPg - 1)}
          >
            <CaretLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPgs }).map((_, index) => {
            const page = index + 1
            const shouldShow =
              page === 1 || page === totalPgs || Math.abs(page - currentPg) <= 1
            if (!shouldShow) {
              if (page === 2 || page === totalPgs - 1) {
                return <span key={`ellipsis-${page}`} className="px-1 text-xs text-gray-400">...</span>
              }
              return null
            }
            return (
              <Button
                key={page}
                variant={currentPg === page ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPg === totalPgs}
            onClick={() => onPageChange(currentPg + 1)}
          >
            <CaretRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 md:flex-row lg:px-8">
      {/* Left Sidebar (Desktop only) */}
      <aside className="sticky top-[var(--spacing-app-header)] hidden h-[calc(100vh-var(--spacing-app-header))] w-[220px] flex-shrink-0 border-r border-gray-200 md:block dark:border-gray-800">
        <ScrollArea className="h-full">
          <div className="py-3 pr-2">
            {/* 社区 */}
            <div className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              <Globe className="h-4 w-4" />
              <span>社区</span>
            </div>

            {/* Category list - always visible */}
            <div className="mt-1 ml-2">
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
                <div className="space-y-0.5">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveTab("community")
                        handleCategoryClick(category.id)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors",
                        activeTab === "community" &&
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

            {/* 我的 tab */}
            <button
              onClick={() => setActiveTab("mine")}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors",
                activeTab === "mine"
                  ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <User className="h-4 w-4" />
              <span>我的</span>
            </button>
          </div>
        </ScrollArea>
      </aside>

      {/* Right Content */}
      <main className="min-w-0 flex-1">
        <div className="py-3 md:pl-6">
          {/* Mobile Tabs */}
          <div className="-mx-4 mb-4 overflow-x-auto px-4 md:hidden">
            <div className="flex gap-2 pb-2">
              <span className="flex flex-shrink-0 items-center gap-1.5 px-1 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                <Globe className="h-3.5 w-3.5" />
                社区
              </span>
              <button
                onClick={() => setActiveTab("mine")}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  activeTab === "mine"
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                <User className="h-3.5 w-3.5" />
                我的
              </button>
              {/* Mobile category tabs - only when community */}
              {activeTab === "community" && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Community Tab */}
          {activeTab === "community" && (
            <>
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
                  <Button
                    variant="outline"
                    className="h-10 gap-2 whitespace-nowrap"
                  >
                    <CloudArrowDown className="h-4 w-4" />
                    <span className="hidden sm:inline">提交 MCP</span>
                  </Button>
                </Link>
              </div>

              {isLoading && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-border/50 bg-card h-[200px] animate-pulse rounded-xl border p-5"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="bg-muted h-9 w-9 rounded-full" />
                        <div className="space-y-2">
                          <div className="bg-muted h-4 w-32 rounded" />
                          <div className="bg-muted/60 h-3 w-20 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-muted/60 h-3 w-full rounded" />
                        <div className="bg-muted/60 h-3 w-4/5 rounded" />
                        <div className="bg-muted/60 h-3 w-3/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {mcpServers.map((server) => (
                    <Link
                      href={`/mcp/${server.owner}/${server.server_name}`}
                      key={`${server.owner}/${server.server_name}`}
                    >
                      <div className="group border-border/50 bg-card hover:border-primary/30 hover:shadow-primary/5 relative flex h-[200px] flex-col rounded-xl border p-5 transition-all duration-300 hover:shadow-xl">
                        <div className="mb-3 flex items-center gap-3">
                          <Avatar className="ring-border/50 h-9 w-9 flex-shrink-0 ring-1">
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
                              className="text-foreground truncate text-sm font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              title={server.server_name}
                            >
                              {server.server_name}
                            </h3>
                            <p className="text-muted-foreground truncate text-xs">
                              {server.owner}
                            </p>
                          </div>
                        </div>
                        <p
                          className="text-muted-foreground mb-auto line-clamp-3 text-sm leading-relaxed"
                          title={server.description}
                        >
                          {server.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant="outline" className="gap-1 text-xs">
                            {getServerTypeIcon(server.server_type)}
                            {getServerTypeLabel(server.server_type)}
                          </Badge>
                          <div className="text-muted-foreground flex items-center gap-3 text-xs">
                            {server.tools > 0 && (
                              <span
                                className="flex items-center gap-1"
                                title="工具数量"
                              >
                                <Wrench className="h-3.5 w-3.5" />
                                {server.tools}
                              </span>
                            )}
                            {server.prompts > 0 && (
                              <span
                                className="flex items-center gap-1"
                                title="提示词数量"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {server.prompts}
                              </span>
                            )}
                            {server.resources > 0 && (
                              <span
                                className="flex items-center gap-1"
                                title="资源数量"
                              >
                                <FolderOpen className="h-3.5 w-3.5" />
                                {server.resources}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

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

              {renderPagination(
                currentPage,
                totalPages,
                totalServers,
                handlePageChange
              )}
            </>
          )}

          {/* Mine Tab */}
          {activeTab === "mine" && (
            <>
              {!isJwtAuthenticated ? (
                <div className="py-16 text-center">
                  <User className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    请先登录查看我的 MCP 服务器
                  </p>
                  <Link href="/user/auth/login">
                    <Button size="sm">登录</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {isMyMcpLoading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="border-border/50 bg-card h-[160px] animate-pulse rounded-xl border p-5"
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <div className="bg-muted h-9 w-9 rounded-full" />
                            <div className="space-y-2">
                              <div className="bg-muted h-4 w-32 rounded" />
                              <div className="bg-muted/60 h-3 w-20 rounded" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-muted/60 h-3 w-full rounded" />
                            <div className="bg-muted/60 h-3 w-4/5 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isMyMcpLoading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {myMcps.map((server) => (
                        <Link
                          href={`/mcp/${server.user.username}/${server.server_name}`}
                          key={server.id}
                        >
                          <div className="group border-border/50 bg-card hover:border-primary/30 hover:shadow-primary/5 relative flex h-[160px] flex-col rounded-xl border p-5 transition-all duration-300 hover:shadow-xl">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="bg-muted ring-border/50 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1">
                                {server.server_name
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className="text-foreground truncate text-sm font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                  title={
                                    server.server_title || server.server_name
                                  }
                                >
                                  {server.server_title || server.server_name}
                                </h3>
                                <p className="text-muted-foreground truncate text-xs">
                                  {server.server_name}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  server.is_public ? "default" : "secondary"
                                }
                                className="flex-shrink-0 text-xs"
                              >
                                {server.is_public ? "公开" : "私有"}
                              </Badge>
                            </div>
                            <p
                              className="text-muted-foreground mb-auto line-clamp-2 text-sm leading-relaxed"
                              title={server.description || ""}
                            >
                              {server.description || "暂无描述"}
                            </p>
                            <div className="mt-3 flex items-center">
                              <Badge
                                variant="outline"
                                className="gap-1 text-xs"
                              >
                                {getServerTypeIcon(server.server_type)}
                                {getServerTypeLabel(server.server_type)}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {myMcps.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                          <Server className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            你还没有创建任何 MCP 服务器
                          </p>
                          <Link href="/build/mcp">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <CloudArrowDown className="h-4 w-4" />
                              提交 MCP
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {renderPagination(
                    myMcpPage,
                    myTotalPages,
                    myMcpResponse?.total || 0,
                    handleMyMcpPageChange
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
