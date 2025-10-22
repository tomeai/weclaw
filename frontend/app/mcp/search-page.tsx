"use client"

import {
  getMcpServerFeed,
  McpFeedResponse,
  McpSearchParams,
  McpSearchResponse,
  McpServerItem,
  searchMcpServers,
} from "@/app/lib/api"
import { BreadcrumbItem, Breadcrumbs } from "@/components/common/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react"
import { Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("popularity")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResponse, setSearchResponse] =
    useState<McpSearchResponse | null>(null)
  const [mcpServers, setMcpServers] = useState<McpServerItem[]>([])

  const itemsPerPage = 1 // Based on the API response size parameter
  const totalServers = searchResponse?.data.total || 0
  const totalPages = searchResponse?.data.total_pages || 1

  // Function to fetch MCP servers
  const fetchMcpServers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!searchQuery.trim()) {
        // If search query is empty, fetch the feed
        const feedResponse: McpFeedResponse = await getMcpServerFeed()
        // Adapt feed response to search response structure for state consistency
        setSearchResponse({
          code: feedResponse.code,
          msg: feedResponse.msg,
          data: {
            items: feedResponse.data,
            total: feedResponse.data.length,
            page: 1,
            size: feedResponse.data.length,
            total_pages: 1,
            links: {
              first: "",
              last: "",
              self: "",
              next: null,
              prev: null,
            },
          },
        })
        setMcpServers(feedResponse.data)
      } else {
        // Convert string category to number if needed
        const categoryId = selectedCategory ? parseInt(selectedCategory) : 0

        // Prepare search parameters
        const params: McpSearchParams = {
          page: currentPage,
          size: itemsPerPage,
          category_id: categoryId,
          keyword: searchQuery,
        }

        // Call the search API
        const response = await searchMcpServers(params)
        setSearchResponse(response)
        setMcpServers(response.data.items)
      }
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

  // Fetch data on initial mount
  useEffect(() => {
    fetchMcpServers()
  }, []) // Empty dependency array means this runs once on mount

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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
    { label: "MCP Servers", href: "/mcp" },
    { label: searchQuery ? `"${searchQuery}"` : "Search" },
  ]

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Search Box */}
      <div className="relative mx-auto mb-12 w-full max-w-3xl">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <MagnifyingGlass className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <Input
          type="text"
          placeholder="搜索 MCP 服务器..."
          className="h-14 rounded-lg border-gray-200 py-3 pr-4 pl-14 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-auto mb-6 w-full max-w-2xl rounded-md bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Results (Right Side) */}
        <div className="w-full md:flex-1">
          {/* Results Info */}
          <div className="mb-4 flex items-center justify-start">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">{totalServers}</span>{" "}
              servers
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}

          {/* Server results */}
          {!isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mcpServers.map((server, index) => {
                // Count the number of tools, prompts, and resources
                const toolsCount = server.tools?.length || 0
                const promptsCount = server.prompts ? 1 : 0 // Simplified, adjust based on actual structure
                const resourcesCount = server.resources ? 1 : 0 // Simplified, adjust based on actual structure

                // Generate a seed for the avatar based on the server title
                const avatarSeed = server.server_title
                  .replace(/\s+/g, "-")
                  .toLowerCase()

                return (
                  <Link href={`/mcp/${server.id}`} key={index}>
                    <Card className="group h-[220px] w-full border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:hover:border-blue-600">
                      <CardContent className="flex h-full flex-col p-5">
                        <div className="flex h-full flex-col">
                          {/* Header with title and avatar */}
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex w-full items-center gap-3 overflow-hidden">
                              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100 transition-all group-hover:ring-blue-200 dark:ring-gray-700 dark:group-hover:ring-blue-600">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
                                  alt={server.server_title}
                                />
                                <AvatarFallback className="bg-gray-100 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  {server.server_title.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex w-full min-w-0 flex-col overflow-hidden">
                                <div className="flex w-full items-center gap-2 overflow-hidden">
                                  <h3
                                    className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-400"
                                    title={server.server_title}
                                  >
                                    {server.server_title}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description with fixed height and truncation */}
                          <div className="mb-auto">
                            <p
                              className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                              title={server.description}
                            >
                              {server.description}
                            </p>
                          </div>

                          {/* Capability badges at the bottom */}
                          <div className="mt-auto flex flex-wrap gap-2">
                            {toolsCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                {toolsCount} tools
                              </Badge>
                            )}
                            {promptsCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                {promptsCount} prompts
                              </Badge>
                            )}
                            {resourcesCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                {resourcesCount} resources
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
                  <p className="text-gray-500 dark:text-gray-400">
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
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
