import http from "@/lib/http"
import { PaginatedData } from "@/lib/mcp"
import {
  API_ROUTE_AGENT_CATEGORIES,
  API_ROUTE_AGENT_SEARCH,
  API_ROUTE_AGENT_ADMIN_SERVERS,
  API_ROUTE_AGENT_ADMIN_SERVER_DETAIL,
} from "./routes"

// ============ Agent Category ============

export interface AgentCategory {
  id: number
  name: string
}

// ============ Agent Search Item ============

export interface AgentSearchItem {
  title: string
  avatar: string
  description: string
  owner: string
  tools: number
  skills: number
  knowledge: number
  databases: number
}

export interface AgentSearchParams {
  page?: number
  size?: number
  category_id?: number
  keyword?: string
}

/** 获取 Agent 分类列表 */
export function getAgentCategories(): Promise<AgentCategory[]> {
  return http.get<AgentCategory[]>(API_ROUTE_AGENT_CATEGORIES)
}

/** 搜索 Agent */
export function searchAgents(
  params: AgentSearchParams = {}
): Promise<PaginatedData<AgentSearchItem>> {
  return http.post<PaginatedData<AgentSearchItem>>(API_ROUTE_AGENT_SEARCH, {
    page: params.page || 1,
    size: params.size || 10,
    category_id: params.category_id ?? 0,
    keyword: params.keyword || "",
  })
}

// ============ Admin Agent ============

export interface AgentAdminItem {
  id: number
  title: string
  avatar: string | null
  description: string | null
  owner: string
  tools: number
  skills: number
  knowledge: number
  databases: number
  created_time?: string
  updated_time?: string | null
}

export interface AgentAdminSearchParams {
  page?: number
  size?: number
  keyword?: string
  category_id?: number
}

/** 管理端 - 获取 Agent 列表 */
export function getAgentAdminServers(
  params: AgentAdminSearchParams = {}
): Promise<PaginatedData<AgentAdminItem>> {
  return http.post<PaginatedData<AgentAdminItem>>(
    API_ROUTE_AGENT_ADMIN_SERVERS,
    {
      page: params.page || 1,
      size: params.size || 20,
      keyword: params.keyword || "",
      category_id: params.category_id ?? 0,
    }
  )
}

/** 管理端 - 删除 Agent */
export function deleteAgentAdmin(
  agentId: string | number
): Promise<null> {
  return http.delete<null>(
    `${API_ROUTE_AGENT_ADMIN_SERVER_DETAIL}/${agentId}`
  )
}
