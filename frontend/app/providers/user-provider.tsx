// app/providers/user-provider.tsx
"use client"

import { getCurrentUser } from "@/app/lib/api"
import { createContext, useContext, useEffect, useState } from "react"

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  isJwtAuthenticated: boolean
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
            const currentUserData = await getCurrentUser()
            console.log(`[UserData]: ${currentUserData}`)
            // setUser({
            //   avatar: currentUserData.data.avatar || "",
            //   nickname: currentUserData.data.nickname || "",
            // })
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
