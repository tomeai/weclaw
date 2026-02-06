"use client"

import { NaviMenu } from "@/components/layout/navi-menu"
import { McpDropdown } from "@/components/mcp/mcp-dropdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { APP_NAME } from "@/lib/config"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useUser } from "@/components/providers/user-provider"

export function Header() {
  const { user, isJwtAuthenticated, signOut } = useUser()
  const isLoggedIn = !!user || isJwtAuthenticated
  const [isScrolled, setIsScrolled] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
      // Adjust glass effect based on scroll position
      const header = document.querySelector("header")
      if (header) {
        const opacity = Math.min(scrollTop / 100, 0.6)
        const blurAmount = Math.min(scrollTop / 5, 20)

        // Apply styles with smooth transitions
        header.style.backdropFilter = `blur(${blurAmount}px)`
        const isDark = document.documentElement.classList.contains("dark")
        const bgColor = isDark
          ? `rgba(0, 0, 0, ${opacity})`
          : `rgba(255, 255, 255, ${opacity})`
        header.style.backgroundColor = bgColor
        header.style.boxShadow = `0 2px 8px rgba(0, 0, 0, ${opacity * 0.2})`

        // Add class for when header is fully transparent
        if (scrollTop === 0) {
          header.classList.add("header-transparent")
        } else {
          header.classList.remove("header-transparent")
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`h-app-header fixed top-0 right-0 left-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-border/80 bg-background/40 glass-effect border-b shadow-sm backdrop-blur-xl"
          : "header-transparent"
      }`}
    >
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:bg-transparent lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-medium tracking-tight">
            {APP_NAME}
          </Link>
          <div className="hidden md:block">
            <NaviMenu />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-4 md:flex">
            <McpDropdown />
            {!isLoggedIn && (
              <Link
                href="/user/auth/login"
                className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
              >
                登录
              </Link>
            )}
          </div>
          {!isLoggedIn ? (
            <div className="md:hidden">
              <NaviMenu />
            </div>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.nickname} />
                      <AvatarFallback>
                        {user?.nickname?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.nickname && (
                        <p className="font-medium">{user.nickname}</p>
                      )}
                      {user?.email && (
                        <p className="text-muted-foreground w-[200px] truncate text-sm">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/user/profile" className="cursor-pointer">
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user/admin" className="cursor-pointer">
                      系统管理
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="ml-4 md:hidden">
                <NaviMenu />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
