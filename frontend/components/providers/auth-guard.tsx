"use client"

import { useUser } from "@/components/providers/user-provider"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

/** 需要登录才能访问的路由前缀 */
const PROTECTED_ROUTES = ["/chat", "/build", "/user"]

/** 不需要登录的白名单（优先级高于 PROTECTED_ROUTES） */
const PUBLIC_ROUTES = ["/user/auth/login", "/user/auth/callback"]

/** 需要管理员权限（is_staff 或 is_superuser）的路由前缀 */
const ADMIN_ROUTES = ["/user/admin"]

function isProtected(pathname: string) {
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return false
  }
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isJwtAuthenticated, isInitialized } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!isInitialized) return

    if (isProtected(pathname)) {
      const isLoggedIn = !!user || isJwtAuthenticated
      if (!isLoggedIn) {
        router.push(`/user/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
        setAuthorized(false)
        return
      }
      // Admin route: require is_staff or is_superuser
      if (isAdminRoute(pathname) && user && !user.is_staff && !user.is_superuser) {
        router.push("/")
        setAuthorized(false)
        return
      }
      setAuthorized(true)
    } else {
      setAuthorized(true)
    }
  }, [user, isJwtAuthenticated, pathname, isInitialized, router])

  if (!isInitialized && isProtected(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    )
  }

  if (!authorized && isProtected(pathname)) {
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
