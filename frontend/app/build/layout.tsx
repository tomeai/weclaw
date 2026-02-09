"use client"

import { useUser } from "@/components/providers/user-provider"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isJwtAuthenticated, isInitialized } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isInitialized) return

    const isLoggedIn = !!user || isJwtAuthenticated

    if (!isLoggedIn) {
      router.push(`/user/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
    } else {
      setIsChecking(false)
    }
  }, [user, isJwtAuthenticated, pathname, isInitialized, router])

  if (!isInitialized || isChecking || (!user && !isJwtAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
