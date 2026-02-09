import http from "@/lib/http"
import { PaginatedData } from "@/lib/mcp"
import { API_ROUTE_AGENT_CATEGORIES, API_ROUTE_AGENT_SEARCH } from "./routes"

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
