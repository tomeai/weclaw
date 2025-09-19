"use client"

import {
  callMcpServerTool,
  getMcpServerDetail,
  McpServerDetailResponse,
} from "@/app/lib/api"
import {
  API_ROUTE_MCP_COMPILE_STDIO,
} from "@/app/lib/routes"
import { Breadcrumbs } from "@/components/common/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Play } from "@phosphor-icons/react"
import { Home } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ServerDetailClient({ serverId }: { serverId: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serverDetail, setServerDetail] =
    useState<McpServerDetailResponse | null>(null)
  const [toolResults, setToolResults] = useState<
    Record<
      string,
      { isLoading: boolean; result: string | null; error: string | null }
    >
  >({})
  const [toolInputs, setToolInputs] = useState<
    Record<string, Record<string, any>>
  >({})
  const [envInputs, setEnvInputs] = useState<Record<string, string>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectResult, setConnectResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    const fetchServerDetail = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getMcpServerDetail(serverId)
        setServerDetail(response)

        // Initialize tool inputs with default values
        if (response.data.tools?.tools) {
          const initialInputs: Record<string, Record<string, any>> = {}

          response.data.tools.tools.forEach((tool) => {
            const toolName = tool.name
            const inputs: Record<string, any> = {}

            if (tool.inputSchema?.properties) {
              Object.entries(tool.inputSchema.properties).forEach(
                ([paramName, paramDetails]: [string, any]) => {
                  // Set default value if available, otherwise empty string
                  inputs[paramName] =
                    paramDetails.default !== undefined
                      ? paramDetails.default
                      : ""
                }
              )
            }

            initialInputs[toolName] = inputs
          })

          setToolInputs(initialInputs)
        }

        // Initialize environment variables if present
        if (response.data.envs && Object.keys(response.data.envs).length > 0) {
          const initialEnvs: Record<string, string> = {}
          Object.entries(response.data.envs).forEach(([key, value]) => {
            initialEnvs[key] = value as string
          })
          setEnvInputs(initialEnvs)
        }
      } catch (err) {
        console.error("Error fetching server details:", err)
        setError("Failed to load server details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchServerDetail()
  }, [serverId])

  const handleInputChange = (
    toolName: string,
    paramName: string,
    value: string
  ) => {
    setToolInputs((prev) => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        [paramName]: value,
      },
    }))
  }

  const handleEnvInputChange = (envName: string, value: string) => {
    setEnvInputs((prev) => ({
      ...prev,
      [envName]: value,
    }))
  }

  const validateToolInputs = (
    toolName: string,
    tool: any
  ): { isValid: boolean; missingParams: string[] } => {
    const requiredParams = tool.inputSchema?.required || []
    const inputs = toolInputs[toolName] || {}

    const missingParams = requiredParams.filter(
      (param: string) =>
        !inputs[param] || inputs[param].toString().trim() === ""
    )

    return {
      isValid: missingParams.length === 0,
      missingParams,
    }
  }

  const handleConnect = async () => {
    if (!serverDetail) return

    setIsConnecting(true)
    setConnectResult(null)

    try {
      const response = await fetch(API_ROUTE_MCP_COMPILE_STDIO, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mcp_id: serverId,
          envs: envInputs,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setConnectResult({
          success: true,
          message: "Successfully connected to MCP server",
        })
      } else {
        setConnectResult({
          success: false,
          message: data.error || "Failed to connect to MCP server",
        })
      }
    } catch (err: any) {
      setConnectResult({
        success: false,
        message:
          err.message || "An error occurred while connecting to MCP server",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRunTool = async (toolName: string, tool: any) => {
    if (!serverDetail) return

    // Validate required parameters
    const { isValid, missingParams } = validateToolInputs(toolName, tool)

    if (!isValid) {
      setToolResults((prev) => ({
        ...prev,
        [toolName]: {
          isLoading: false,
          result: null,
          error: `Missing required parameters: ${missingParams.join(", ")}`,
        },
      }))
      return
    }

    setToolResults((prev) => ({
      ...prev,
      [toolName]: { isLoading: true, result: null, error: null },
    }))

    try {
      const response = await callMcpServerTool(
        serverId,
        toolName,
        toolInputs[toolName] || {}
      )

      // Extract the text content from the response
      const resultText = response.data.content
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n")

      setToolResults((prev) => ({
        ...prev,
        [toolName]: { isLoading: false, result: resultText, error: null },
      }))
    } catch (err: any) {
      setToolResults((prev) => ({
        ...prev,
        [toolName]: {
          isLoading: false,
          result: null,
          error: err.message || "Failed to run tool",
        },
      }))
    }
  }

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
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/mcp" className="text-primary hover:underline">
          Return to MCP Servers
        </Link>
      </div>
    )
  }

  if (isLoading || !serverDetail) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="border-foreground h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  const { data: server } = serverDetail

  // Count the number of tools
  const toolsCount = server.tools?.tools?.length || 0

  // Generate a seed for the avatar based on the server title
  const avatarSeed = server.title.replace(/\s+/g, "-").toLowerCase()

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-start pt-12 md:pt-16"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
            { label: "MCP Servers", href: "/mcp" },
            { label: server.title },
          ]}
          className="mt-5 mb-6"
        />

        {/* Server Metadata */}
        <div className="bg-muted/50 mb-8 rounded-lg border p-6">
          <div className="mb-4 flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
                alt={server.title}
              />
              <AvatarFallback>
                {server.title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="mb-2 text-left text-3xl font-bold">
                {server.title}
              </h1>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {toolsCount} tools
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  v{server.capabilities.serverInfo.version}
                </Badge>
                {server.server_type && (
                  <Badge
                    variant={
                      server.server_type === "hosted" ? "default" : "secondary"
                    }
                    className={`px-3 py-1 ${server.server_type === "hosted" ? "bg-blue-500" : "bg-green-500"} text-white`}
                  >
                    {server.server_type === "hosted" ? "Hosted" : "Local"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-foreground mb-4">{server.description}</p>
          <div className="text-muted-foreground text-sm">
            <div>
              <span className="font-medium">Server Name:</span>{" "}
              {server.capabilities.serverInfo.name}
            </div>
            <div>
              <span className="font-medium">Protocol Version:</span>{" "}
              {server.capabilities.protocolVersion}
            </div>
          </div>
        </div>

        {/* Main Content with 3/5 - 2/5 Layout */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Tools Section (3/5 width) */}
          <div className="w-full md:w-3/5">
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="tools">Tools ({toolsCount})</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              </TabsList>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-6">
                {server.tools && server.tools.tools.length > 0 ? (
                  server.tools.tools.map((tool, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Tool Info and Parameters */}
                        <div className="w-full">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="text-lg font-semibold">
                              {tool.name}
                            </h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRunTool(tool.name, tool)}
                              disabled={toolResults[tool.name]?.isLoading}
                            >
                              <Play className="mr-1 h-4 w-4" />
                              Run
                            </Button>
                          </div>
                          <p className="text-muted-foreground mb-3">
                            {tool.description}
                          </p>

                          {tool.inputSchema && (
                            <div className="mt-3">
                              <h4 className="text-foreground mb-2 text-sm font-medium">
                                Input Parameters:
                              </h4>
                              <div className="bg-muted/50 rounded border p-3 text-sm">
                                {tool.inputSchema.properties && (
                                  <div className="space-y-3">
                                    {Object.entries(
                                      tool.inputSchema.properties
                                    ).map(
                                      ([paramName, paramDetails]: [
                                        string,
                                        any,
                                      ]) => (
                                        <div
                                          key={paramName}
                                          className="flex flex-col"
                                        >
                                          <div className="mb-1 flex items-start">
                                            <span className="font-mono text-blue-600">
                                              {paramName}
                                            </span>
                                            {tool.inputSchema.required?.includes(
                                              paramName
                                            ) && (
                                              <span className="ml-1 text-red-500">
                                                *
                                              </span>
                                            )}
                                            <span className="ml-2 text-gray-500">
                                              ({paramDetails.type})
                                            </span>
                                          </div>
                                          {paramDetails.description && (
                                            <span className="text-muted-foreground mb-1 text-xs">
                                              {paramDetails.description}
                                            </span>
                                          )}
                                          <Input
                                            value={
                                              toolInputs[tool.name]?.[
                                                paramName
                                              ] || ""
                                            }
                                            onChange={(e) =>
                                              handleInputChange(
                                                tool.name,
                                                paramName,
                                                e.target.value
                                              )
                                            }
                                            placeholder={`Enter ${paramName}`}
                                            className="mt-1"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tool Results - Bottom */}
                        <div className="mt-2 w-full border-t pt-4">
                          <h4 className="text-foreground mb-2 text-sm font-medium">
                            Result:
                          </h4>

                          {toolResults[tool.name]?.isLoading && (
                            <div className="flex items-center justify-center py-4">
                              <div className="border-foreground h-6 w-6 animate-spin rounded-full border-b-2"></div>
                            </div>
                          )}

                          {toolResults[tool.name]?.error && (
                            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded border p-3 text-sm">
                              <p className="font-medium">Error:</p>
                              <p>{toolResults[tool.name].error}</p>
                            </div>
                          )}

                          {toolResults[tool.name]?.result && (
                            <div className="bg-muted/50 rounded border p-3">
                              <pre className="bg-muted max-h-[400px] overflow-auto rounded p-2 text-xs">
                                {toolResults[tool.name].result}
                              </pre>
                            </div>
                          )}

                          {!toolResults[tool.name] && (
                            <div className="bg-muted/30 text-muted-foreground rounded border p-3 text-sm italic">
                              Run the tool to see results here
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    No tools available for this MCP server.
                  </div>
                )}
              </TabsContent>

              {/* Capabilities Tab */}
              <TabsContent value="capabilities">
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="mb-4 text-lg font-semibold">
                    Server Capabilities
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-foreground font-medium">
                        Protocol Version
                      </h4>
                      <p className="text-muted-foreground">
                        {server.capabilities.protocolVersion}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium">
                        Server Info
                      </h4>
                      <div className="border-border mt-2 border-l-2 pl-4">
                        <p>
                          <span className="text-muted-foreground">Name:</span>{" "}
                          {server.capabilities.serverInfo.name}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Version:
                          </span>{" "}
                          {server.capabilities.serverInfo.version}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium">
                        Supported Features
                      </h4>
                      <div className="border-border mt-2 space-y-2 border-l-2 pl-4">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${server.capabilities.capabilities.tools ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span>Tools</span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${server.capabilities.capabilities.resources ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span>Resources</span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${server.capabilities.capabilities.prompts ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span>Prompts</span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${server.capabilities.capabilities.logging ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span>Logging</span>
                        </div>
                      </div>
                    </div>

                    {Object.keys(
                      server.capabilities.capabilities.experimental || {}
                    ).length > 0 && (
                      <div>
                        <h4 className="text-foreground font-medium">
                          Experimental Features
                        </h4>
                        <div className="border-border mt-2 border-l-2 pl-4">
                          <pre className="bg-muted/50 overflow-x-auto rounded border p-2 text-sm">
                            {JSON.stringify(
                              server.capabilities.capabilities.experimental,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Environment Variables Section (2/5 width) */}
          {serverDetail &&
          serverDetail.data.envs &&
          Object.keys(serverDetail.data.envs).length > 0 ? (
            <div className="mt-18 w-full md:w-2/5">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Configure the environment variables required by this MCP
                    server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(serverDetail.data.envs).map(
                      ([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <label className="text-foreground mb-1 text-sm font-medium">
                            {key}
                          </label>
                          <Input
                            value={envInputs[key] || ""}
                            onChange={(e) =>
                              handleEnvInputChange(key, e.target.value)
                            }
                            placeholder={`Enter ${key}`}
                          />
                        </div>
                      )
                    )}

                    <div className="mt-4">
                      <Button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>

                      {connectResult && (
                        <div
                          className={`mt-2 rounded p-2 text-sm ${connectResult.success ? "border border-green-500/20 bg-green-500/10 text-green-700" : "border border-red-500/20 bg-red-500/10 text-red-700"}`}
                        >
                          {connectResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
