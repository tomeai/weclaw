"use client"

import { getAuthMe } from "@/lib/user"
import { createContext, useContext, useEffect, useState } from "react"

export type UserProfile = {
  id: string
  nickname: string
  avatar: string
  email: string
  daily_message_count: number
}

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  isJwtAuthenticated: boolean
  setUser: (user: UserProfile | null) => void
  isInitialized: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: UserProfile | null
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [isJwtAuthenticated, setIsJwtAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // 添加初始化状态

  useEffect(() => {
    const checkJwtToken = async () => {
      if (typeof window === "undefined") return

      const token = localStorage.getItem("auth_token")
      console.log("[UserProvider] 检查 JWT token:", !!token)

      if (token) {
        setIsJwtAuthenticated(true)

        if (!user) {
          try {
            const userData = await getAuthMe()
            console.log(`[UserData]: ${JSON.stringify(userData)}`)
            setUser({
              id: userData.id || userData.nickname || "",
              nickname: userData.nickname || "",
              avatar: userData.avatar || "",
              email: userData.email || "",
              daily_message_count: 0,
            })
          } catch (error) {
            console.error("Failed to fetch user data with JWT token:", error)
            // If token is invalid, clear it
            localStorage.removeItem("auth_token")
            setIsJwtAuthenticated(false)
          }
        }
      } else {
        setIsJwtAuthenticated(false)
      }

      // 标记初始化完成
      setIsInitialized(true)
    }

    checkJwtToken()
  }, []) // 只在组件挂载时执行一次

  const signOut = async () => {
    setIsLoading(true)
    try {
      if (isJwtAuthenticated) {
        localStorage.removeItem("auth_token")
        setIsJwtAuthenticated(false)
      }
      setUser(null)
    } catch (err) {
      console.error("Failed to sign out:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        signOut,
        isJwtAuthenticated,
        setUser,
        isInitialized,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
