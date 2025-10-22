import { ApiClient } from "@/app/lib/client"
import { MODEL_DEFAULT } from "@/app/lib/config"
import {
  API_ROUTE_AUTH_ME,
  API_ROUTE_CREATE_CHAT,
  API_ROUTE_CREATE_GUEST,
  API_ROUTE_GITHUB_OAUTH2_LOGIN,
  API_ROUTE_MCP_ADMIN_CATEGORY,
  API_ROUTE_MCP_ADMIN_CATEGORY_CREATE,
  API_ROUTE_MCP_ADMIN_SERVERS,
  API_ROUTE_MCP_ADMIN_SERVER_DETAIL,
  API_ROUTE_MCP_SEARCH,
  API_ROUTE_MCP_SERVER_CALL,
  API_ROUTE_MCP_SERVER_DETAIL,
  API_ROUTE_MCP_SERVER_FEED,
  API_ROUTE_MCP_SERVER_RECOMMEND,
  API_ROUTE_OAUTH_USER,
  API_ROUTE_UPDATE_CHAT_MODEL,
} from "./routes"

/**
 * Creates a new chat for the specified user
 */
export async function createNewChat(
  userId: string,
  title?: string,
  model?: string,
  isAuthenticated?: boolean,
  systemPrompt?: string
) {
  try {
    const res = await fetch(API_ROUTE_CREATE_CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title,
        model: model || MODEL_DEFAULT,
        isAuthenticated,
        systemPrompt,
      }),
    })
    const responseData = await res.json()

    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to create chat: ${res.status} ${res.statusText}`
      )
    }

    return responseData.chatId
  } catch (error) {
    console.error("Error creating new chat:", error)
    throw error
  }
}

/**
 * Creates a guest user record on the server
 */
export async function createGuestUser(guestId: string) {
  try {
    const res = await fetch(API_ROUTE_CREATE_GUEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: guestId }),
    })
    const responseData = await res.json()
    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to create guest user: ${res.status} ${res.statusText}`
      )
    }

    return responseData
  } catch (err) {
    console.error("Error creating guest user:", err)
    throw err
  }
}

/**
 * Checks the user's daily usage and increments both overall and daily counters.
 * Resets the daily counter if a new day (UTC) is detected.
 * Uses the `anonymous` flag from the user record to decide which daily limit applies.
 *
 * @param supabase - Your Supabase client.
 * @param userId - The ID of the user.
 * @returns The remaining daily limit.
 */
export async function checkRateLimits(
  userId: string,
  isAuthenticated: boolean
) {
  try {
    const res = await fetch(
      `/api/rate-limits?userId=${userId}&isAuthenticated=${isAuthenticated}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
    const responseData = await res.json()
    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to check rate limits: ${res.status} ${res.statusText}`
      )
    }
    return responseData
  } catch (err) {
    console.error("Error checking rate limits:", err)
    throw err
  }
}

/**
 * Updates the model for an existing chat
 */
export async function updateChatModel(chatId: string, model: string) {
  try {
    const res = await fetch(API_ROUTE_UPDATE_CHAT_MODEL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, model }),
    })
    const responseData = await res.json()

    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update chat model: ${res.status} ${res.statusText}`
      )
    }

    return responseData
  } catch (error) {
    console.error("Error updating chat model:", error)
    throw error
  }
}

/**
 * Signs in user with Github OAuth
 * @returns The GitHub OAuth URL to redirect the user to
 */
export async function signInWithGithub() {
  try {
    // Send GET request to the GitHub OAuth endpoint
    const response = await ApiClient.get<{
      code: number
      msg: string
      data: string
    }>(API_ROUTE_GITHUB_OAUTH2_LOGIN)

    // Check if the request was successful
    if (response.code !== 200) {
      throw new Error(`Failed to get GitHub OAuth URL: ${response.msg}`)
    }

    // Return the GitHub OAuth URL from the response
    return {
      url: response.data,
    }
  } catch (err) {
    console.error("Error signing in with Github:", err)
    throw err
  }
}

/**
 * MCP Search API response interface
 */
export interface McpSearchResponse {
  code: number
  msg: string
  data: {
    items: McpServerItem[]
    total: number
    page: number
    size: number
    total_pages: number
    links: {
      first: string
      last: string
      self: string
      next: string | null
      prev: string | null
    }
  }
}

/**
 * MCP Server item interface
 */
export interface McpServerItem {
  id: Number
  server_title: string
  description: string
  server_type?: "hosted" | "local"
  mcp_endpoint?: string
  envs?: Record<string, string>
  server_metadata: {
    meta: any
    protocolVersion: string
    capabilities: {
      experimental: Record<string, any>
      logging: any
      prompts: any
      resources: any
      tools: {
        listChanged: boolean
      }
    }
    serverInfo: {
      name: string
      version: string
    }
    instructions: any
  }
  tools?: Array<{
    name: string
    description: string
    inputSchema: Record<string, any>
  }>
  prompts?: any
  resources?: any
  created_time?: string
  updated_time?: string
  user?: {
    username: string
  }
}

/**
 * MCP Server detail response interface
 */
export interface McpServerDetailResponse {
  code: number
  msg: string
  data: McpServerItem
}

/**
 * MCP Search parameters interface
 */
export interface McpSearchParams {
  page?: number
  size?: number
  category_id?: number
  keyword?: string
}

/**
 * Searches for MCP servers
 *
 * @param params - Search parameters
 * @returns MCP search results
 */
export async function searchMcpServers(
  params: McpSearchParams = {}
): Promise<McpSearchResponse> {
  try {
    // Set default values for pagination if not provided
    const searchParams: McpSearchParams = {
      page: params.page || 1,
      size: params.size || 10,
      category_id: params.category_id !== undefined ? params.category_id : 0,
      keyword: params.keyword || "",
    }

    // Make GET request to MCP search API
    const response = await ApiClient.post<McpSearchResponse>(
      API_ROUTE_MCP_SEARCH,
      searchParams
    )

    return response
  } catch (error) {
    console.error("Error searching MCP servers:", error)
    throw error
  }
}

/**
 * MCP Feed response interface
 */
export interface McpFeedResponse {
  code: number
  msg: string
  data: McpServerItem[]
}

/**
 * Gets the feed of MCP servers
 *
 * @returns MCP feed results
 */
export async function getMcpServerFeed(): Promise<McpFeedResponse> {
  try {
    const response = await ApiClient.get<McpFeedResponse>(
      API_ROUTE_MCP_SERVER_FEED
    )
    return response
  } catch (error) {
    console.error("Error getting MCP server feed:", error)
    throw error
  }
}

/**
 * Gets details for a specific MCP server
 *
 * @param serverId - The ID of the MCP server
 * @returns MCP server details
 */
export async function getMcpServerDetail(
  serverId: string | number
): Promise<McpServerDetailResponse> {
  try {
    const url = `${API_ROUTE_MCP_SERVER_DETAIL}/${serverId}`
    const response = await ApiClient.get<McpServerDetailResponse>(url)
    return response
  } catch (error) {
    console.error(`Error getting MCP server details for ID ${serverId}:`, error)
    throw error
  }
}

/**
 * MCP Server call response interface
 */
export interface McpServerCallResponse {
  code: number
  msg: string
  data: {
    _meta: any
    content: Array<{
      type: string
      text: string
      annotations?: any
    }>
    isError: boolean
  }
}

/**
 * Calls a tool on a specific MCP server
 *
 * @param mcpId - The ID of the MCP server
 * @param toolName - The name of the tool to call
 * @param arguments - The arguments to pass to the tool
 * @returns The result of the tool call
 */
export async function callMcpServerTool(
  mcpId: string | number,
  toolName: string,
  args: Record<string, any>
): Promise<McpServerCallResponse> {
  try {
    const url = `${API_ROUTE_MCP_SERVER_CALL}/${mcpId}`
    const body = {
      tool_name: toolName,
      arguments: args,
    }
    const response = await ApiClient.post<McpServerCallResponse>(url, body)
    return response
  } catch (error) {
    console.error(
      `Error calling MCP server tool ${toolName} on server ${mcpId}:`,
      error
    )
    throw error
  }
}

export interface UserItem {
  nickname: string
  avatar: string
}

export interface GetCurrentUserResponse {
  code: number
  msg: string
  data: UserItem
}

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  try {
    const response =
      await ApiClient.get<GetCurrentUserResponse>(API_ROUTE_OAUTH_USER)
    return response
  } catch (error) {
    console.error("Error getting current user:", error)
    throw error
  }
}

export interface GetAuthMeResponse {
  code: number
  msg: string
  data: {
    id: string
    nickname: string
    avatar: string
    email?: string
    [key: string]: any
  }
}

/**
 * Gets current user information using the auth/me endpoint
 * This endpoint requires a Bearer token in the Authorization header
 */
export async function getAuthMe(): Promise<GetAuthMeResponse> {
  try {
    const response = await ApiClient.get<GetAuthMeResponse>(API_ROUTE_AUTH_ME)
    return response
  } catch (error) {
    console.error("Error getting auth me:", error)
    throw error
  }
}

/**
 * MCP Server capabilities interface for recommend API
 */
export interface McpRecommendServerCapabilities {
  tools?: {
    listChanged?: boolean
  }
  logging?: any
  prompts?: {
    listChanged?: boolean
  } | null
  resources?: {
    subscribe?: boolean
    listChanged?: boolean
  } | null
  completions?: any
  experimental?: Record<string, any> | null
}

/**
 * MCP Server item interface for recommend API
 */
export interface McpRecommendServer {
  server_title: string
  server_name: string
  description: string
  server_type: "hosted" | "local"
  capabilities: McpRecommendServerCapabilities
  tools: number
}

/**
 * MCP Category interface for recommend API
 */
export interface McpRecommendCategory {
  id: number
  name: string
  servers: McpRecommendServer[]
}

/**
 * MCP Recommend response interface
 */
export interface McpRecommendResponse {
  code: number
  msg: string
  data: McpRecommendCategory[]
}

/**
 * Gets recommended MCP servers by category
 *
 * @returns MCP recommend results
 */
export async function getMcpServerRecommend(): Promise<McpRecommendResponse> {
  try {
    const response = await ApiClient.get<McpRecommendResponse>(
      API_ROUTE_MCP_SERVER_RECOMMEND
    )
    return response
  } catch (error) {
    console.error("Error getting MCP server recommend:", error)
    throw error
  }
}

/**
 * MCP Admin Server item interface
 */
export interface McpAdminServerItem {
  id: number
  server_title: string
  server_name: string
  description: string
  server_type: "hosted" | "local"
  compile_type: "package" | "stdio"
  git?: string
  created_time: string
  updated_time?: string | null
}

/**
 * MCP Admin Servers response interface
 */
export interface McpAdminServersResponse {
  code: number
  msg: string
  data: {
    items: McpAdminServerItem[]
    total: number
    page: number
    size: number
    total_pages: number
    links: {
      first: string
      last: string
      self: string
      next: string | null
      prev: string | null
    }
  }
}

/**
 * MCP Admin Servers parameters interface
 */
export interface McpAdminServersParams {
  page?: number
  size?: number
  keyword?: string
  server_type?: "hosted" | "local"
  compile_type?: "package" | "stdio"
  is_public?: number
  transport?: "stdio" | "sse" | "streamable"
}

/**
 * Gets all MCP servers for admin management
 *
 * @param params - Query parameters
 * @returns MCP admin servers list
 */
export async function getMcpAdminServers(
  params: McpAdminServersParams = {}
): Promise<McpAdminServersResponse> {
  try {
    // Set default values for pagination if not provided
    const queryParams: McpAdminServersParams = {
      page: params.page || 1,
      size: params.size || 20,
      keyword: params.keyword || "",
      ...params,
    }

    // Filter out undefined and null values
    const filteredParams: Record<string, any> = {}
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        filteredParams[key] = value
      }
    })

    // Make POST request to MCP admin servers API
    const response = await ApiClient.post<McpAdminServersResponse>(
      API_ROUTE_MCP_ADMIN_SERVERS,
      filteredParams
    )
    return response
  } catch (error) {
    console.error("Error getting MCP admin servers:", error)
    throw error
  }
}

/**
 * MCP Admin Category item interface
 */
export interface McpAdminCategoryItem {
  id: number
  name: string
  is_recommend: number
  created_time: string
  updated_time?: string | null
}

/**
 * MCP Admin Category response interface
 */
export interface McpAdminCategoryResponse {
  code: number
  msg: string
  data: {
    items: McpAdminCategoryItem[]
    total: number
    page: number
    size: number
    total_pages: number
    links: {
      first: string
      last: string
      self: string
      next: string | null
      prev: string | null
    }
  }
}

/**
 * MCP Admin Category parameters interface
 */
export interface McpAdminCategoryParams {
  is_recommend?: number
}

/**
 * Gets all MCP categories for admin management
 *
 * @param params - Query parameters
 * @returns MCP admin categories list
 */
export async function getMcpAdminCategories(
  params: McpAdminCategoryParams = {}
): Promise<McpAdminCategoryResponse> {
  try {
    // Set default values
    const queryParams: McpAdminCategoryParams = {
      is_recommend: params.is_recommend ?? -1,
      ...params,
    }

    // Filter out undefined and null values
    const filteredParams: Record<string, any> = {}
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filteredParams[key] = value
      }
    })

    // Make POST request to MCP admin category API
    const response = await ApiClient.post<McpAdminCategoryResponse>(
      `${API_ROUTE_MCP_ADMIN_CATEGORY}`,
      filteredParams
    )
    return response
  } catch (error) {
    console.error("Error getting MCP admin categories:", error)
    throw error
  }
}

/**
 * MCP Admin Category create parameters interface
 */
export interface McpAdminCategoryCreateParams {
  name: string
  is_recommend: boolean
}

/**
 * MCP Admin Category create response interface
 */
export interface McpAdminCategoryCreateResponse {
  code: number
  msg: string
  data: null
}

/**
 * Creates a new MCP category
 *
 * @param params - Category creation parameters
 * @returns Create category response
 */
export async function createMcpAdminCategory(
  params: McpAdminCategoryCreateParams
): Promise<McpAdminCategoryCreateResponse> {
  try {
    const response = await ApiClient.post<McpAdminCategoryCreateResponse>(
      API_ROUTE_MCP_ADMIN_CATEGORY_CREATE,
      params
    )
    return response
  } catch (error) {
    console.error("Error creating MCP admin category:", error)
    throw error
  }
}

/**
 * MCP Admin Server Detail item interface
 */
export interface McpAdminServerDetailItem {
  id: number
  server_name: string
  server_title: string
  description: string
  server_type: "hosted" | "local"
  compile_type: "package" | "stdio"
  git?: string
  user: {
    username: string
    avatar: string
  }
  category: {
    id: number
    name: string
    is_recommend: number
  }
}

/**
 * MCP Admin Server Detail response interface
 */
export interface McpAdminServerDetailResponse {
  code: number
  msg: string
  data: McpAdminServerDetailItem
}

/**
 * Gets details for a specific MCP server for admin management
 *
 * @param serverId - The ID of the MCP server
 * @returns MCP admin server details
 */
export async function getMcpAdminServerDetail(
  serverId: string | number
): Promise<McpAdminServerDetailResponse> {
  try {
    const url = `${API_ROUTE_MCP_ADMIN_SERVER_DETAIL}/${serverId}`
    const response = await ApiClient.get<McpAdminServerDetailResponse>(url)
    return response
  } catch (error) {
    console.error(`Error getting MCP admin server details for ID ${serverId}:`, error)
    throw error
  }
}

/**
 * MCP Admin Server Update parameters interface
 */
export interface McpAdminServerUpdateParams {
  category_id: number
  description: string
  server_title: string
}

/**
 * MCP Admin Server Update response interface
 */
export interface McpAdminServerUpdateResponse {
  code: number
  msg: string
  data: null
}

/**
 * Updates a specific MCP server for admin management
 *
 * @param serverId - The ID of the MCP server
 * @param params - Update parameters
 * @returns Update response
 */
export async function updateMcpAdminServer(
  serverId: string | number,
  params: McpAdminServerUpdateParams
): Promise<McpAdminServerUpdateResponse> {
  try {
    const url = `${API_ROUTE_MCP_ADMIN_SERVER_DETAIL}/${serverId}`
    const response = await ApiClient.put<McpAdminServerUpdateResponse>(url, params)
    return response
  } catch (error) {
    console.error(`Error updating MCP admin server ${serverId}:`, error)
    throw error
  }
}
