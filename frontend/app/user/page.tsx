import { ProfileSidebar } from "@/app/components/profile/profile-sidebar"
import ProfileLayout from "@/app/components/layout/profile-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Activity, Heart, MessageSquare, Settings, User, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  // 模拟用户数据
  const userStats = [
    {
      title: "今日消息数",
      value: "42",
      change: "+8",
      changeType: "positive" as const,
      icon: MessageSquare,
    },
    {
      title: "收藏的MCP",
      value: "12",
      change: "+2",
      changeType: "positive" as const,
      icon: Heart,
    },
    {
      title: "API调用次数",
      value: "1,234",
      change: "+156",
      changeType: "positive" as const,
      icon: Zap,
    },
    {
      title: "活跃天数",
      value: "28",
      change: "+7",
      changeType: "positive" as const,
      icon: Activity,
    },
  ]

  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" alt="用户头像" />
                <AvatarFallback>用户</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">张三</CardTitle>
                <CardDescription>zhangsan@example.com</CardDescription>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    活跃用户
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    VIP会员
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userStats.map((stat) => (
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
                  较昨日
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
                <Settings className="mr-2 h-5 w-5" />
                账户设置
              </CardTitle>
              <CardDescription>管理个人信息和偏好设置</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                我的收藏
              </CardTitle>
              <CardDescription>查看收藏的MCP服务器</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                使用记录
              </CardTitle>
              <CardDescription>查看API调用历史和使用统计</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>您最近的使用记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">使用了 Code Interpreter MCP</p>
                  <p className="text-xs text-muted-foreground">2小时前</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">收藏了 File System MCP</p>
                  <p className="text-xs text-muted-foreground">5小时前</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">更新了个人资料</p>
                  <p className="text-xs text-muted-foreground">昨天</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}
