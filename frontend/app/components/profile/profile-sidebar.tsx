"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  Bell,
  FileText,
  Heart,
  History,
  Settings,
  Shield,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Profile routes
export const ROUTE_PROFILE = "/user"
export const ROUTE_PROFILE_SETTINGS = "/user/settings"
export const ROUTE_PROFILE_FAVORITES = "/user/favorites"
export const ROUTE_PROFILE_HISTORY = "/user/history"
export const ROUTE_PROFILE_ANALYTICS = "/user/analytics"
export const ROUTE_PROFILE_NOTIFICATIONS = "/user/notifications"
export const ROUTE_PROFILE_SECURITY = "/user/security"
export const ROUTE_PROFILE_HELP = "/user/help"

const sidebarItems = [
  {
    title: "个人中心",
    href: ROUTE_PROFILE,
    icon: User,
  },
  {
    title: "账户设置",
    href: ROUTE_PROFILE_SETTINGS,
    icon: Settings,
  },
  {
    title: "我的收藏",
    href: ROUTE_PROFILE_FAVORITES,
    icon: Heart,
  },
  {
    title: "使用记录",
    href: ROUTE_PROFILE_HISTORY,
    icon: History,
  },
  {
    title: "使用统计",
    href: ROUTE_PROFILE_ANALYTICS,
    icon: BarChart3,
  },
  {
    title: "通知中心",
    href: ROUTE_PROFILE_NOTIFICATIONS,
    icon: Bell,
  },
  {
    title: "安全设置",
    href: ROUTE_PROFILE_SECURITY,
    icon: Shield,
  },
  {
    title: "帮助文档",
    href: ROUTE_PROFILE_HELP,
    icon: FileText,
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
