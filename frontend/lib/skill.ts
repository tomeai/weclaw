import http from "@/lib/http"
import { PaginatedData } from "@/lib/mcp"
import { API_ROUTE_SKILL_CATEGORIES, API_ROUTE_SKILL_SEARCH } from "./routes"

// ============ Skill Category ============

export interface SkillCategory {
  id: number
  name: string
}

// ============ Skill Search Item ============

export interface SkillSearchItem {
  name: string
  description: string
  path: string
  owner: string
  favorite_count: number
}

export interface SkillSearchParams {
  page?: number
  size?: number
  category_id?: number
  keyword?: string
}

/** 获取 Skill 分类列表 */
export function getSkillCategories(): Promise<SkillCategory[]> {
  return http.get<SkillCategory[]>(API_ROUTE_SKILL_CATEGORIES)
}

/** 搜索 Skill */
export function searchSkills(
  params: SkillSearchParams = {}
): Promise<PaginatedData<SkillSearchItem>> {
  return http.post<PaginatedData<SkillSearchItem>>(API_ROUTE_SKILL_SEARCH, {
    page: params.page || 1,
    size: params.size || 20,
    category_id: params.category_id ?? 0,
    keyword: params.keyword || "",
  })
}
