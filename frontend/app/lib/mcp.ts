import http from "@/app/lib/http"
import {
  API_ROUTE_MCP_ADMIN_CATEGORY,
  API_ROUTE_MCP_ADMIN_CATEGORY_CREATE,
  API_ROUTE_MCP_ADMIN_SERVER_DETAIL,
  API_ROUTE_MCP_ADMIN_SERVERS,
  API_ROUTE_MCP_DEPLOY_PACKAGE,
  API_ROUTE_MCP_SEARCH,
  API_ROUTE_MCP_SERVER_CALL,
  API_ROUTE_MCP_SERVER_DETAIL,
  API_ROUTE_MCP_SERVER_FEED,
  API_ROUTE_MCP_SERVER_RECOMMEND,
} from "./routes"

// ============ 通用类型 ============

export interface PaginatedData<T> {
  items: T[]
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

// ============ MCP Server ============

export interface McpServerItem {
  id: number
  server_title: string
  server_name: string
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

export interface McpSearchParams {
  page?: number
  size?: number
  category_id?: number
  keyword?: string
}

export interface McpServerCallResult {
  _meta: any
  content: Array<{
    type: string
    text: string
    annotations?: any
  }>
  isError: boolean
}

// ============ 推荐 ============

export interface McpRecommendServerCapabilities {
  tools?: { listChanged?: boolean }
  logging?: any
  prompts?: { listChanged?: boolean } | null
  resources?: { subscribe?: boolean; listChanged?: boolean } | null
  completions?: any
  experimental?: Record<string, any> | null
}

export interface McpRecommendServer {
  server_title: string
  server_name: string
  description: string
  server_type: "hosted" | "local"
  capabilities: McpRecommendServerCapabilities
  tools: number
  user: {
    username: string
    nickname: string
    avatar: string
  }
}

export interface McpRecommendCategory {
  id: number
  name: string
  servers: McpRecommendServer[]
}
// ============ Admin MCP Server ============

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

export interface McpAdminServersParams {
  page?: number
  size?: number
  keyword?: string
  server_type?: "hosted" | "local"
  compile_type?: "package" | "stdio"
  is_public?: number
  transport?: "stdio" | "sse" | "streamable"
}

export interface McpAdminServerDetailItem {
  id: number
  server_name: string
  server_title: string
  is_public: number
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

export interface McpAdminServerUpdateParams {
  category_id: number
  description: string
  server_title: string
  is_public: number
}

// ============ Admin Category ============

export interface McpAdminCategoryItem {
  id: number
  name: string
  is_recommend: number
  created_time: string
  updated_time?: string | null
}

export interface McpAdminCategoryParams {
  is_recommend?: number
}

export interface McpAdminCategoryCreateParams {
  name: string
  is_recommend: number
}

/** 搜索 MCP 服务器 */
export function searchMcpServers(
  params: McpSearchParams = {}
): Promise<PaginatedData<McpServerItem>> {
  return http.post<PaginatedData<McpServerItem>>(API_ROUTE_MCP_SEARCH, {
    page: params.page || 1,
    size: params.size || 10,
    category_id: params.category_id ?? 0,
    keyword: params.keyword || "",
  })
}

/** 获取 MCP 服务器 feed */
export function getMcpServerFeed(): Promise<McpServerItem[]> {
  return http.get<McpServerItem[]>(API_ROUTE_MCP_SERVER_FEED)
}

/** 获取 MCP 服务器详情 */
export function getMcpServerDetail(
  username: string,
  serverName: string
): Promise<McpServerItem> {
  return http.get<McpServerItem>(
    `${API_ROUTE_MCP_SERVER_DETAIL}/${username}/${serverName}`
  )
}

/** 调用 MCP 服务器工具 */
export function callMcpServerTool(
  mcpId: string | number,
  toolName: string,
  args: Record<string, any>
): Promise<McpServerCallResult> {
  return http.post<McpServerCallResult>(
    `${API_ROUTE_MCP_SERVER_CALL}/${mcpId}`,
    {
      tool_name: toolName,
      arguments: args,
    }
  )
}

/** 获取推荐 MCP 服务器 */
export function getMcpServerRecommend(): Promise<McpRecommendCategory[]> {
  return http.get<McpRecommendCategory[]>(API_ROUTE_MCP_SERVER_RECOMMEND)
}

/** 管理端 - 获取 MCP 服务器列表 */
export function getMcpAdminServers(
  params: McpAdminServersParams = {}
): Promise<PaginatedData<McpAdminServerItem>> {
  return http.post<PaginatedData<McpAdminServerItem>>(
    API_ROUTE_MCP_ADMIN_SERVERS,
    {
      page: params.page || 1,
      size: params.size || 20,
      ...params,
    }
  )
}

/** 管理端 - 获取 MCP 服务器详情 */
export function getMcpAdminServerDetail(
  serverId: string | number
): Promise<McpAdminServerDetailItem> {
  return http.get<McpAdminServerDetailItem>(
    `${API_ROUTE_MCP_ADMIN_SERVER_DETAIL}/${serverId}`
  )
}

/** 管理端 - 更新 MCP 服务器 */
export function updateMcpAdminServer(
  serverId: string | number,
  params: McpAdminServerUpdateParams
): Promise<null> {
  return http.put<null>(
    `${API_ROUTE_MCP_ADMIN_SERVER_DETAIL}/${serverId}`,
    params
  )
}

/** 管理端 - 获取分类列表 */
export function getMcpAdminCategories(
  params: McpAdminCategoryParams = {}
): Promise<PaginatedData<McpAdminCategoryItem>> {
  return http.post<PaginatedData<McpAdminCategoryItem>>(
    API_ROUTE_MCP_ADMIN_CATEGORY,
    {
      is_recommend: params.is_recommend ?? -1,
      ...params,
    }
  )
}

/** 管理端 - 创建分类 */
export function createMcpAdminCategory(
  params: McpAdminCategoryCreateParams
): Promise<null> {
  return http.post<null>(API_ROUTE_MCP_ADMIN_CATEGORY_CREATE, params)
}

// ============ MCP 提交 ============

export interface McpSubmitData {
  server_title: string
  description?: string
  mcpServers: any
}

/** 提交 MCP 服务器配置 */
export function submitMcpServer(data: McpSubmitData): Promise<any> {
  return http.post(API_ROUTE_MCP_DEPLOY_PACKAGE, data)
}
