import http from "@/app/lib/http"
import {
  API_ROUTE_AUTH_ME,
  API_ROUTE_GITHUB_OAUTH2_LOGIN,
  API_ROUTE_OAUTH_USER,
} from "@/app/lib/routes"

// ============ 用户 ============

export interface UserItem {
  nickname: string
  avatar: string
}

export interface AuthMeData {
  id: string
  nickname: string
  avatar: string
  email?: string
  [key: string]: any
}

/** GitHub OAuth 登录 */
export function signInWithGithub(): Promise<{ url: string }> {
  return http
    .get<string>(API_ROUTE_GITHUB_OAUTH2_LOGIN)
    .then((url) => ({ url }))
}

/** 获取当前 OAuth 用户 */
export function getCurrentUser(): Promise<UserItem> {
  return http.get<UserItem>(API_ROUTE_OAUTH_USER)
}

/** 获取当前登录用户信息 */
export function getAuthMe(): Promise<AuthMeData> {
  return http.get<AuthMeData>(API_ROUTE_AUTH_ME)
}
