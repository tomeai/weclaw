"use client"

import { cn } from "@/lib/utils"
import { BarChart3, Bell, Heart, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Profile routes
export const ROUTE_PROFILE = "/user/profile"
export const ROUTE_PROFILE_SETTINGS = "/user/profile/settings"
export const ROUTE_PROFILE_FAVORITES = "/user/profile/favorites"
export const ROUTE_PROFILE_HISTORY = "/user/profile/history"
export const ROUTE_PROFILE_NOTIFICATIONS = "/user/profile/notifications"

const sidebarItems = [
  {
    title: "个人中心",
    href: ROUTE_PROFILE,
    icon: User,
  },
  {
    title: "我的收藏",
    href: ROUTE_PROFILE_FAVORITES,
    icon: Heart,
  },
  {
    title: "使用统计",
    href: ROUTE_PROFILE_HISTORY,
    icon: BarChart3,
  },
  {
    title: "通知中心",
    href: ROUTE_PROFILE_NOTIFICATIONS,
    icon: Bell,
  },
  {
    title: "账户设置",
    href: ROUTE_PROFILE_SETTINGS,
    icon: Settings,
  },
]

export function ProfileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "transparent"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
