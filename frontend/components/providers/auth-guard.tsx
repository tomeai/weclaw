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

/** 管理后台根路径，任何管理员均可访问 */
const ADMIN_ROOT = "/user/admin"

function hasMenuAccess(pathname: string, menuPaths: string[]): boolean {
  // 根路径始终允许
  if (pathname === ADMIN_ROOT) return true
  return menuPaths.some(
    (menuPath) =>
      pathname === menuPath || pathname.startsWith(`${menuPath}/`)
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isJwtAuthenticated, isInitialized, userMenuPaths } = useUser()
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
      // 菜单路径权限校验：非超级管理员需校验具体路径
      if (
        isAdminRoute(pathname) &&
        user &&
        !user.is_superuser &&
        !hasMenuAccess(pathname, userMenuPaths)
      ) {
        router.push(ADMIN_ROOT)
        setAuthorized(false)
        return
      }
      setAuthorized(true)
    } else {
      setAuthorized(true)
    }
  }, [user, isJwtAuthenticated, pathname, isInitialized, router, userMenuPaths])

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
