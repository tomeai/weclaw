"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  McpSearchParams,
  McpSearchServerItem,
  PaginatedData,
  searchMcpServers,
} from "@/lib/mcp"
import { cn } from "@/lib/utils"
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("popularity")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResponse, setSearchResponse] =
    useState<PaginatedData<McpSearchServerItem> | null>(null)
  const [mcpServers, setMcpServers] = useState<McpSearchServerItem[]>([])

  const itemsPerPage = 1 // Based on the API response size parameter
  const totalServers = searchResponse?.total || 0
  const totalPages = searchResponse?.total_pages || 1

  // Function to fetch MCP servers
  const fetchMcpServers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert string category to number if needed
      const categoryId = selectedCategory ? parseInt(selectedCategory) : 0

      // Prepare search parameters
      const params: McpSearchParams = {
        page: currentPage,
        size: itemsPerPage,
        category_id: categoryId,
        keyword: searchQuery,
      }

      // Call the API
      const data = await searchMcpServers(params)
      setSearchResponse(data)
      setMcpServers(data.items)
    } catch (err: any) {
      console.error("Error fetching MCP servers:", err)

      // Check if it's a timeout error
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("请求超时，服务器响应时间过长。请稍后重试或检查网络连接。")
      } else {
        setError("Failed to fetch MCP servers. Please try again.")
      }

      // Set empty results on error
      setMcpServers([])
      setSearchResponse(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when component mounts or when search parameters change
  useEffect(() => {
    fetchMcpServers()
  }, [currentPage, selectedCategory, sortOption])

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page
    fetchMcpServers()
  }

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const categories: { id: string; name: string; count: number }[] = []

  return (
    <>
      {/* Search Box */}
      <div className="relative mx-auto mb-12 w-full max-w-2xl">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <MagnifyingGlass className="h-6 w-6 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="搜索你感兴趣的智能体..."
          className="h-14 rounded-lg border-gray-200 py-3 pr-4 pl-14 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-auto mb-6 w-full max-w-2xl rounded-md bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Categories (Left Side) */}
        <div className="w-full md:w-60">
          <Card className="sticky top-4 border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-1.5 rounded-sm bg-blue-500"></div>
                <h2 className="text-lg font-semibold text-gray-900">分类</h2>
              </div>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-gray-50",
                      selectedCategory === category.id &&
                        "border border-blue-200 bg-blue-50"
                    )}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )
                    }
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedCategory === category.id
                          ? "text-blue-700"
                          : "text-gray-700"
                      )}
                    >
                      {category.name}
                    </span>
                    <Badge
                      variant={
                        selectedCategory === category.id
                          ? "default"
                          : "secondary"
                      }
                      className={cn(
                        "text-xs",
                        selectedCategory === category.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results (Right Side) */}
        <div className="w-full md:flex-1">
          {/* Sort Options */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{totalServers}</span>{" "}
              servers
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="newest">Hosted</SelectItem>
                  <SelectItem value="oldest">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Server results */}
          {!isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mcpServers.map((server, index) => {
                return (
                  <Link href={`/mcp/${server.owner}/${server.server_name}`} key={index}>
                    <Card className="group h-[220px] w-full border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg">
                      <CardContent className="flex h-full flex-col p-5">
                        <div className="flex h-full flex-col">
                          {/* Header with title and avatar */}
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex w-full items-center gap-3 overflow-hidden">
                              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100 transition-all group-hover:ring-blue-200">
                                <AvatarImage
                                  src={server.avatar}
                                  alt={server.server_name}
                                />
                                <AvatarFallback className="bg-gray-100 text-xs font-medium text-gray-700">
                                  {server.server_name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex w-full min-w-0 flex-col overflow-hidden">
                                <div className="flex w-full items-center gap-2 overflow-hidden">
                                  <h3
                                    className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-700"
                                    title={server.server_name}
                                  >
                                    {server.server_name}
                                  </h3>
                                </div>
                                <p className="truncate text-xs text-gray-500">{server.owner}</p>
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

                          {/* Capability badges at the bottom */}
                          <div className="mt-auto flex flex-wrap gap-2">
                            {server.tools > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                              >
                                {server.tools} tools
                              </Badge>
                            )}
                            {server.prompts > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                              >
                                {server.prompts} prompts
                              </Badge>
                            )}
                            {server.resources > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                              >
                                {server.resources} resources
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}

              {/* Show a message if no servers found */}
              {mcpServers.length === 0 && !isLoading && (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-gray-500">
                    {error
                      ? "无法加载MCP服务器，请稍后重试。"
                      : "No MCP servers found matching your criteria."}
                  </p>
                  {error && (
                    <button
                      onClick={fetchMcpServers}
                      className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                    >
                      重新加载
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalServers)} of{" "}
              {totalServers} servers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <CaretLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1
                // Show first page, last page, current page, and pages around current
                const shouldShow =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1

                // Show ellipsis for gaps
                if (!shouldShow) {
                  // Only show one ellipsis between gaps
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span key={`ellipsis-${pageNumber}`} className="px-2">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="h-8 w-8"
                  >
                    {pageNumber}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                <CaretRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
