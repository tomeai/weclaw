"use client"

import { getMcpServerFeed, McpServerItem } from "@/lib/mcp"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function LeaderboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mcpServers, setMcpServers] = useState<McpServerItem[]>([])

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const servers = await getMcpServerFeed()

        // Filter servers that have non-empty capabilities.capabilities
        const filteredServers = servers.filter((server) => {
          const capabilities = server.capabilities?.capabilities
          if (!capabilities) return false

          // Check if at least one capability is non-null
          return Object.values(capabilities).some((value) => value !== null)
        })

        setMcpServers(filteredServers)
      } catch (err) {
        console.error("Error fetching MCP server feed:", err)
        setError("Failed to load MCP server feed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeed()
  }, [])

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="mb-4 text-gray-600">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date"
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return dateString
    }
  }

  // Function to get categories from capabilities
  const getCategories = (server: McpServerItem) => {
    const categories = []
    const capabilities = server.capabilities?.capabilities

    if (capabilities) {
      if (capabilities.tools) categories.push("Tools")
      if (capabilities.resources) categories.push("Resources")
      if (capabilities.prompts) categories.push("Prompts")
      if (capabilities.logging) categories.push("Logging")
      if (Object.keys(capabilities.experimental || {}).length > 0)
        categories.push("Experimental")
    }

    return categories.length > 0 ? categories : ["API"]
  }

  return (
    <div className="w-full">
      {/* Waterfall/Masonry Layout */}
      <div className="grid auto-rows-max grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mcpServers.map((server) => (
          <Link href={`/mcp/${server.id}`} key={server.id.toString()}>
            <Card className="h-[200px] w-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col pt-6">
                <div className="flex flex-col">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{server.title}</h3>
                    {server.server_type && (
                      <Badge
                        variant={
                          server.server_type === "hosted"
                            ? "default"
                            : "secondary"
                        }
                        className={`mt-1 w-fit ${server.server_type === "hosted" ? "bg-blue-500" : "bg-green-500"} text-white`}
                      >
                        {server.server_type === "hosted" ? "Hosted" : "Local"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 mb-3 text-sm text-gray-600">
                    {server.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {getCategories(server).map((category, idx) => (
                      <Badge key={idx} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>By {server.user?.username || "Unknown"}</span>
                    <span>{formatDate(server.created_time)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
