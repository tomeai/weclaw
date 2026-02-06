"use client"

import ProfileLayout from "@/components/layout/profile-layout"
import { ProfileSidebar } from "@/components/sidebar/profile-sidebar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Info,
  Mail,
  MailOpen,
  Megaphone,
  Server,
  ShieldAlert,
  Trash2,
} from "lucide-react"
import { useState } from "react"

type NotificationType = "system" | "mcp" | "security" | "announcement"
type NotificationStatus = "unread" | "read"

interface Notification {
  id: string
  title: string
  content: string
  type: NotificationType
  status: NotificationStatus
  timestamp: string
}

// 模拟通知数据
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "MCP服务器更新",
    content:
      "您收藏的 Code Interpreter 已更新至 v2.3.0，新增了Python 3.12支持。",
    type: "mcp",
    status: "unread",
    timestamp: "2024-02-06 10:30",
  },
  {
    id: "2",
    title: "安全提醒",
    content: "检测到您的账户在新设备上登录，如非本人操作请及时修改密码。",
    type: "security",
    status: "unread",
    timestamp: "2024-02-06 09:15",
  },
  {
    id: "3",
    title: "系统维护通知",
    content:
      "平台将于2024年2月10日凌晨2:00-4:00进行系统维护，届时服务可能暂时不可用。",
    type: "system",
    status: "unread",
    timestamp: "2024-02-05 18:00",
  },
  {
    id: "4",
    title: "新功能上线",
    content: "WeMCP平台新增Agent编排功能，支持多MCP协同工作流，快来体验吧！",
    type: "announcement",
    status: "read",
    timestamp: "2024-02-05 14:20",
  },
  {
    id: "5",
    title: "API调用额度提醒",
    content: "您本月的API调用量已达到套餐限额的80%，请注意合理使用或升级套餐。",
    type: "system",
    status: "read",
    timestamp: "2024-02-04 11:00",
  },
  {
    id: "6",
    title: "MCP审核通过",
    content: "您提交的 Custom Analytics MCP 已通过审核，现已上架到MCP市场。",
    type: "mcp",
    status: "read",
    timestamp: "2024-02-03 16:45",
  },
  {
    id: "7",
    title: "密码修改成功",
    content: "您的账户密码已于2024年2月2日成功修改，如非本人操作请联系客服。",
    type: "security",
    status: "read",
    timestamp: "2024-02-02 20:30",
  },
  {
    id: "8",
    title: "社区活动公告",
    content:
      "WeMCP开发者大赛正式启动，提交优秀MCP作品赢取丰厚奖品！截止日期3月31日。",
    type: "announcement",
    status: "read",
    timestamp: "2024-02-01 09:00",
  },
]

const typeConfig: Record<
  NotificationType,
  { label: string; icon: typeof Bell; color: string }
> = {
  system: { label: "系统", icon: Info, color: "text-blue-500" },
  mcp: { label: "MCP", icon: Server, color: "text-purple-500" },
  security: { label: "安全", icon: ShieldAlert, color: "text-red-500" },
  announcement: { label: "公告", icon: Megaphone, color: "text-orange-500" },
}

export default function ProfileNotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => n.status === "unread").length
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return n.status === "unread"
    return n.type === activeTab
  })

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "read" as NotificationStatus } : n
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "read" as NotificationStatus }))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => n.status === "unread"))
  }

  const getTypeIcon = (type: NotificationType) => {
    const config = typeConfig[type]
    const Icon = config.icon
    return <Icon className={`h-5 w-5 ${config.color}`} />
  }

  const getTypeBadge = (type: NotificationType) => {
    const config = typeConfig[type]
    return <Badge variant="outline">{config.label}</Badge>
  }

  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">通知中心</h1>
            <p className="text-muted-foreground">查看和管理您的所有通知消息</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              全部已读
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              disabled={notifications.length === unreadCount}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清除已读
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-muted-foreground text-sm">全部通知</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-muted-foreground text-sm">未读通知</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n) => n.type === "security").length}
                  </p>
                  <p className="text-muted-foreground text-sm">安全通知</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MailOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n) => n.status === "read").length}
                  </p>
                  <p className="text-muted-foreground text-sm">已读通知</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 分类标签 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              全部
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              未读
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="system">系统</TabsTrigger>
            <TabsTrigger value="mcp">MCP</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
            <TabsTrigger value="announcement">公告</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BellOff className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">暂无通知</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "unread"
                        ? "所有通知都已读"
                        : "当前分类没有通知"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-shadow hover:shadow-md ${
                      notification.status === "unread"
                        ? "border-l-primary border-l-4"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3
                              className={`text-sm font-semibold ${
                                notification.status === "unread"
                                  ? ""
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {getTypeBadge(notification.type)}
                            {notification.status === "unread" && (
                              <Badge className="bg-primary/10 text-primary text-xs">
                                未读
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              notification.status === "unread"
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.content}
                          </p>
                          <p className="text-muted-foreground mt-2 text-xs">
                            {notification.timestamp}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {notification.status === "unread" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="标记为已读"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  )
}
