"use client"

import { useUser } from "@/components/providers/user-provider"
import ProfileLayout from "@/components/layout/profile-layout"
import { ProfileSidebar } from "@/components/sidebar/profile-sidebar"
import {
  ROUTE_PROFILE_FAVORITES,
  ROUTE_PROFILE_HISTORY,
  ROUTE_PROFILE_NOTIFICATIONS,
  ROUTE_PROFILE_SETTINGS,
} from "@/components/sidebar/profile-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AUTH_DAILY_MESSAGE_LIMIT } from "@/lib/config"
import {
  ArrowRight,
  Bell,
  Bot,
  Clock,
  Heart,
  MessageSquare,
  Server,
  Settings,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"

// 模拟统计数据
const mockStats = {
  totalMcps: 3,
  totalAgents: 2,
  totalFavorites: 4,
  totalApiCalls: 156,
  unreadNotifications: 3,
}

// 模拟最近活动数据
const mockRecentActivities = [
  {
    id: "1",
    action: "调用了",
    target: "Code Interpreter",
    type: "agent" as const,
    detail: "代码执行",
    time: "10分钟前",
    status: "success" as const,
  },
  {
    id: "2",
    action: "收藏了",
    target: "Web Scraper",
    type: "mcp" as const,
    detail: "",
    time: "1小时前",
    status: "success" as const,
  },
  {
    id: "3",
    action: "调用了",
    target: "Database Query",
    type: "agent" as const,
    detail: "数据查询",
    time: "2小时前",
    status: "error" as const,
  },
  {
    id: "4",
    action: "发布了",
    target: "Custom Analytics",
    type: "mcp" as const,
    detail: "MCP审核通过",
    time: "3天前",
    status: "success" as const,
  },
]

// 模拟用户MCP
const mockUserMcps = [
  {
    id: "1",
    name: "Custom Analytics",
    description: "自定义数据分析MCP，支持多维度报表",
    status: "published" as const,
    calls: 89,
    rating: 4.6,
    tools: 5,
  },
  {
    id: "2",
    name: "Log Monitor",
    description: "实时日志监控与告警工具",
    status: "published" as const,
    calls: 45,
    rating: 4.3,
    tools: 3,
  },
  {
    id: "3",
    name: "Data Formatter",
    description: "通用数据格式转换工具（开发中）",
    status: "draft" as const,
    calls: 0,
    rating: 0,
    tools: 2,
  },
]

// 模拟用户Agent
const mockUserAgents = [
  {
    id: "1",
    name: "智能数据助手",
    description: "集成多个MCP的数据分析Agent，支持自然语言查询和可视化",
    status: "published" as const,
    mcpCount: 3,
    users: 128,
    conversations: 1560,
  },
  {
    id: "2",
    name: "代码审查助手",
    description: "自动化代码审查Agent，支持多语言代码质量分析和建议",
    status: "published" as const,
    mcpCount: 2,
    users: 76,
    conversations: 890,
  },
]

export default function ProfilePage() {
  const { user } = useUser()

  const messageUsage = user?.daily_message_count ?? 0
  const messagePercent = Math.round(
    (messageUsage / AUTH_DAILY_MESSAGE_LIMIT) * 100
  )

  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 用户信息卡片 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} alt={user?.nickname} />
                <AvatarFallback className="text-2xl">
                  {user?.nickname?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {user?.nickname || "用户"}
                  </h1>
                  <Badge variant="secondary">普通用户</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {user?.email || "未设置邮箱"}
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Server className="h-3.5 w-3.5" />
                    {mockStats.totalMcps} 个MCP
                  </span>
                  <span className="flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5" />
                    {mockStats.totalAgents} 个Agent
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {mockStats.totalFavorites} 个收藏
                  </span>
                </div>
              </div>
              <Link href={ROUTE_PROFILE_SETTINGS}>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  编辑资料
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 + 今日用量 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalMcps}</p>
                  <p className="text-muted-foreground text-xs">我的MCP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalAgents}</p>
                  <p className="text-muted-foreground text-xs">我的Agent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalFavorites}</p>
                  <p className="text-muted-foreground text-xs">我的收藏</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalApiCalls}</p>
                  <p className="text-muted-foreground text-xs">API调用</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {mockStats.unreadNotifications}
                  </p>
                  <p className="text-muted-foreground text-xs">未读通知</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 我的MCP和Agent - Tabs切换 */}
        <Tabs defaultValue="mcp">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="mcp" className="gap-1.5">
                <Server className="h-4 w-4" />
                我的MCP
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {mockUserMcps.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="agent" className="gap-1.5">
                <Bot className="h-4 w-4" />
                我的Agent
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {mockUserAgents.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* MCP列表 */}
          <TabsContent value="mcp" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockUserMcps.map((mcp) => (
                <Card
                  key={mcp.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                          <Server className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{mcp.name}</CardTitle>
                          <Badge
                            variant={
                              mcp.status === "published"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1 text-xs"
                          >
                            {mcp.status === "published" ? "已发布" : "草稿"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                      {mcp.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {mcp.status === "published" && (
                          <>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {mcp.calls}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {mcp.rating}
                            </span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          {mcp.tools} tools
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        管理
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agent列表 */}
          <TabsContent value="agent" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockUserAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">
                            {agent.name}
                          </CardTitle>
                          <Badge
                            variant={
                              agent.status === "published"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1 text-xs"
                          >
                            {agent.status === "published" ? "已发布" : "草稿"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                      {agent.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          {agent.mcpCount} MCP
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {agent.users}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {agent.conversations}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        管理
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  )
}
