"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  Database,
  FileText,
  Server,
  Settings,
  Shield,
  Tags,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    title: "系统概览",
    href: "/admin/overview",
    icon: BarChart3,
  },
  {
    title: "MCP管理",
    href: "/admin/mcp",
    icon: Server,
  },
  {
    title: "分类管理",
    href: "/admin/category",
    icon: Tags,
  },
  {
    title: "用户管理",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "权限管理",
    href: "/admin/permissions",
    icon: Shield,
  },
  {
    title: "数据统计",
    href: "/admin/analytics",
    icon: Database,
  },
  {
    title: "系统设置",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "操作日志",
    href: "/admin/logs",
    icon: FileText,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="h-full flex flex-col">
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
