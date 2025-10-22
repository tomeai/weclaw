"use client"

import { Header } from "./header"
import Footer from "./footer"
import { cn } from "@/lib/utils"
import { useUser } from "@/app/providers/user-provider"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
}

export default function AdminLayout({ children, sidebar }: AdminLayoutProps) {
  const { user, isJwtAuthenticated, isInitialized } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // 只有在初始化完成后才进行认证检查
    if (!isInitialized) return

    console.log('[AdminLayout] 认证状态检查:', {
      user: !!user,
      isJwtAuthenticated,
      pathname,
      isInitialized
    })

    const isLoggedIn = !!user || isJwtAuthenticated
    
    if (!isLoggedIn) {
      // 重定向到登录页面，并保存当前路径作为回调
      console.log('[AdminLayout] 用户未登录，重定向到登录页面')
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
    } else {
      console.log('[AdminLayout] 用户已登录，停止检查状态')
      setIsChecking(false)
    }
  }, [user, isJwtAuthenticated, pathname, isInitialized]) // 添加 isInitialized 到依赖数组

  // 如果正在初始化、检查认证状态或未登录，显示加载状态
  if (!isInitialized || isChecking || (!user && !isJwtAuthenticated)) {
    console.log('[AdminLayout] 显示加载状态:', { isInitialized, isChecking, user: !!user, isJwtAuthenticated })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="isolate min-h-screen">
      <div className="bg-background @container/mainview relative flex min-h-screen w-full">
        <Header />
        <div className="flex flex-1 pt-app-header min-h-screen">
          {/* 侧边栏 - 20% */}
          <aside className="w-[20%] min-w-[200px] max-w-[300px] border-r border-border bg-muted/30">
            <div className="h-full overflow-y-auto p-4">
              {sidebar}
            </div>
          </aside>
          
          {/* 主内容区域 - 80% */}
          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
