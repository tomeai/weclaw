"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { McpSearchParams, McpSearchResponse, McpServerItem, searchMcpServers } from "@/app/lib/api"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("popularity")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResponse, setSearchResponse] = useState<McpSearchResponse | null>(null)
  const [mcpServers, setMcpServers] = useState<McpServerItem[]>([])
  
  const itemsPerPage = 1 // Based on the API response size parameter
  const totalServers = searchResponse?.data.total || 0
  const totalPages = searchResponse?.data.total_pages || 1
  
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
        keyword: searchQuery
      }
      
      // Call the API
      const response = await searchMcpServers(params)
      setSearchResponse(response)
      setMcpServers(response.data.items)
    } catch (err: any) {
      console.error("Error fetching MCP servers:", err)
      
      // Check if it's a timeout error
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
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
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Sample categories
  const categories = [
    { id: "web", name: "数据", count: 42 },
    { id: "data", name: "金融", count: 37 }
  ]

  return (
    <>
      {/* Search Box */}
      <div className="relative w-full max-w-2xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MagnifyingGlass className="h-6 w-6 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="搜索你感兴趣的智能体..."
          className="pl-14 pr-4 py-3 h-14 text-base shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      
      {/* Error message */}
      {error && (
        <div className="w-full max-w-2xl mx-auto mb-6 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories (Left Side) */}
        <div className="w-full md:w-60">
          <Card className="sticky top-4 shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-blue-500 rounded-sm"></div>
                <h2 className="text-lg font-semibold text-gray-900">分类</h2>
              </div>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className={cn(
                      "flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50",
                      selectedCategory === category.id && "bg-blue-50 border border-blue-200"
                    )}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      selectedCategory === category.id ? "text-blue-700" : "text-gray-700"
                    )}>{category.name}</span>
                    <Badge 
                      variant={selectedCategory === category.id ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        selectedCategory === category.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
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
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{totalServers}</span> servers
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
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Server results */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mcpServers.map((server, index) => {
                // Count the number of tools, prompts, and resources
                const toolsCount = server.tools?.tools?.length || 0;
                const promptsCount = server.prompts ? 1 : 0; // Simplified, adjust based on actual structure
                const resourcesCount = server.resources ? 1 : 0; // Simplified, adjust based on actual structure
                
                // Generate a seed for the avatar based on the server title
                const avatarSeed = server.title.replace(/\s+/g, '-').toLowerCase();
                
                return (
                  <Link href={`/mcp/${server.id}`} key={index}>
                    <Card className="h-[220px] w-full hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 group">
                      <CardContent className="h-full flex flex-col p-5">
                        <div className="flex flex-col h-full">
                          {/* Header with title and avatar */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 w-full overflow-hidden">
                              <Avatar className="flex-shrink-0 w-10 h-10 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                                <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} alt={server.title} />
                                <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">{server.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2 w-full overflow-hidden">
                                  <h3 className="text-lg font-semibold truncate flex-1 min-w-0 text-gray-900 group-hover:text-blue-700 transition-colors" title={server.title}>{server.title}</h3>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description with fixed height and truncation */}
                          <div className="mb-auto">
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3" title={server.description}>
                              {server.description}
                            </p>
                          </div>
                          
                          {/* Capability badges at the bottom */}
                          <div className="mt-auto flex flex-wrap gap-2">
                            {toolsCount > 0 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                {toolsCount} tools
                              </Badge>
                            )}
                            {promptsCount > 0 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                {promptsCount} prompts
                              </Badge>
                            )}
                            {resourcesCount > 0 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                {resourcesCount} resources
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              
              {/* Show a message if no servers found */}
              {mcpServers.length === 0 && !isLoading && (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-gray-500">
                    {error 
                      ? "无法加载MCP服务器，请稍后重试。" 
                      : "No MCP servers found matching your criteria."
                    }
                  </p>
                  {error && (
                    <button 
                      onClick={fetchMcpServers}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      重新加载
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalServers)} of {totalServers} servers
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <CaretLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                // Show first page, last page, current page, and pages around current
                const shouldShow = 
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  Math.abs(pageNumber - currentPage) <= 1;
                
                // Show ellipsis for gaps
                if (!shouldShow) {
                  // Only show one ellipsis between gaps
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span key={`ellipsis-${pageNumber}`} className="px-2">...</span>
                    );
                  }
                  return null;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
