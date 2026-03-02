"use client"

import { getUserMenus, SysMenuDetail } from "@/lib/admin-sys"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Bot,
  Box,
  ChevronDown,
  Database,
  FileText,
  FolderOpen,
  Grid,
  Home,
  Key,
  KeyRound,
  LayoutDashboard,
  Lock,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// ====== 图标映射（菜单 icon 字段存储的字符串 → Lucide 组件）======
const ICON_MAP: Record<string, React.ElementType> = {
  BarChart3,
  Bot,
  Box,
  ChevronDown,
  Database,
  FileText,
  FolderOpen,
  Grid,
  Home,
  Key,
  KeyRound,
  LayoutDashboard,
  Lock,
  Server,
  Settings,
  Shield,
  Users,
  Zap,
}

// 默认图标
const DEFAULT_ICON = LayoutDashboard

function getIcon(iconName: string | null | undefined): React.ElementType {
  if (!iconName) return DEFAULT_ICON
  return ICON_MAP[iconName] ?? DEFAULT_ICON
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [items, setItems] = useState<SysMenuDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserMenus()
      .then((menus) => {
        // 只取 type=0 的目录项作为侧边栏导航
        setItems(menus.filter((m) => m.type === 0 && m.status === 1))
      })
      .catch(() => {
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-3 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="text-muted-foreground h-4 w-4 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground px-3 py-4 text-xs">
            暂无菜单权限
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = getIcon(item.icon)
              const href = item.path ?? "#"
              const isActive =
                pathname === href ||
                (href !== "/user/admin" && pathname.startsWith(href))

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
