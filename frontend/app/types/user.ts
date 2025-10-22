export type UserProfile = {
  id: string
  nickname: string
  avatar: string
  email: string
  daily_message_count: number
}

export interface AuthMeResponse {
  id: string
  nickname: string
  avatar: string
  email?: string
  // 可能还有其他字段
}
