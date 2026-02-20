import http from "@/lib/http"
import {
  API_ROUTE_AUTH_ME,
  API_ROUTE_EMAIL_LOGIN,
  API_ROUTE_GITHUB_OAUTH2_LOGIN,
  API_ROUTE_GOOGLE_OAUTH2_LOGIN,
  API_ROUTE_OAUTH_USER,
  API_ROUTE_SEND_EMAIL_CODE,
} from "./routes"

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

/** Google OAuth 登录 */
export function signInWithGoogle(): Promise<{ url: string }> {
  return http
    .get<string>(API_ROUTE_GOOGLE_OAUTH2_LOGIN)
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

/** 发送邮箱验证码 */
export function sendEmailCode(email: string): Promise<any> {
  return http.post(API_ROUTE_SEND_EMAIL_CODE, { email })
}

/** 邮箱验证码登录 */
export function emailLogin(email: string, code: string): Promise<any> {
  return http.post(API_ROUTE_EMAIL_LOGIN, { email, code })
}
