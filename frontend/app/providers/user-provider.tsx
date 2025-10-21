// app/providers/user-provider.tsx
"use client"

import { getAuthMe } from "@/app/lib/api"
import { createContext, useContext, useEffect, useState } from "react"
import { UserProfile } from "@/app/types/user"

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  isJwtAuthenticated: boolean
  setUser: (user: UserProfile | null) => void
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

  useEffect(() => {
    const checkJwtToken = async () => {
      if (typeof window === "undefined") return

      const token = localStorage.getItem("auth_token")
      if (token) {
        setIsJwtAuthenticated(true)

        if (!user) {
          try {
            const currentUserData = await getAuthMe()
            console.log(`[UserData]: ${currentUserData}`)
            
            if (currentUserData.code === 200 && currentUserData.data) {
              setUser({
                id: currentUserData.data.id || currentUserData.data.nickname || "",
                nickname: currentUserData.data.nickname || "",
                avatar: currentUserData.data.avatar || "",
                email: currentUserData.data.email || "",
                daily_message_count: 0,
              })
            }
          } catch (error) {
            console.error("Failed to fetch user data with JWT token:", error)
            // If token is invalid, clear it
            localStorage.removeItem("auth_token")
            setIsJwtAuthenticated(false)
          }
        }
      }
    }

    checkJwtToken()
  }, [user])

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
