import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Activity, Plus, Server, TrendingUp, Users } from "lucide-react"

export default function McpAdminPage() {
  // 模拟数据
  const stats = [
    {
      title: "MCP服务器总数",
      value: "24",
      change: "+2",
      changeType: "positive" as const,
      icon: Server,
    },
    {
      title: "活跃用户",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "今日调用次数",
      value: "8,456",
      change: "+23%",
      changeType: "positive" as const,
      icon: Activity,
    },
    {
      title: "成功率",
      value: "98.5%",
      change: "+0.3%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ]

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">系统概览</h1>
            <p className="text-muted-foreground">管理和监控服务器及相关资源</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-muted-foreground text-xs">
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  较上周
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                添加新MCP
              </CardTitle>
              <CardDescription>上传或配置新的MCP服务器</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                管理服务器
              </CardTitle>
              <CardDescription>查看和管理所有MCP服务器</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                查看日志
              </CardTitle>
              <CardDescription>监控系统活动和使用情况</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
