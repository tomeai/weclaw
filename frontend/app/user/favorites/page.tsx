"use client"

import { useState } from "react"
import { ProfileSidebar } from "@/app/components/profile/profile-sidebar"
import ProfileLayout from "@/app/components/layout/profile-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Search, ExternalLink, Star, Users, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfileFavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  // 模拟收藏的MCP数据
  const favoriteMCPs = [
    {
      id: "1",
      name: "Code Interpreter",
      description: "强大的代码执行和解释工具，支持多种编程语言",
      category: "开发工具",
      author: "OpenAI",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.8,
      users: 12500,
      addedDate: "2024-01-15",
      tags: ["Python", "JavaScript", "代码执行"],
    },
    {
      id: "2",
      name: "File System",
      description: "安全可靠的文件系统操作工具，支持读写各种文件格式",
      category: "系统工具",
      author: "Microsoft",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.6,
      users: 8900,
      addedDate: "2024-01-20",
      tags: ["文件操作", "系统", "存储"],
    },
    {
      id: "3",
      name: "Database Query",
      description: "通用数据库查询工具，支持SQL和NoSQL数据库",
      category: "数据库",
      author: "Community",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.7,
      users: 6700,
      addedDate: "2024-02-01",
      tags: ["SQL", "MongoDB", "PostgreSQL"],
    },
    {
      id: "4",
      name: "Web Scraper",
      description: "智能网页抓取工具，支持动态内容提取",
      category: "网络工具",
      author: "WebDev Team",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.5,
      users: 5400,
      addedDate: "2024-02-10",
      tags: ["爬虫", "数据提取", "网页"],
    },
  ]

  const filteredMCPs = favoriteMCPs.filter(mcp =>
    mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mcp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mcp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedMCPs = [...filteredMCPs].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
      case "name":
        return a.name.localeCompare(b.name)
      case "rating":
        return b.rating - a.rating
      case "users":
        return b.users - a.users
      default:
        return 0
    }
  })

  const handleRemoveFavorite = (id: string) => {
    // 模拟移除收藏
    console.log("移除收藏:", id)
  }

  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的收藏</h1>
          <p className="text-muted-foreground">管理您收藏的MCP服务器</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索收藏的MCP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">最近添加</SelectItem>
              <SelectItem value="name">名称排序</SelectItem>
              <SelectItem value="rating">评分排序</SelectItem>
              <SelectItem value="users">用户数量</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{favoriteMCPs.length}</p>
                  <p className="text-sm text-muted-foreground">总收藏数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-muted-foreground">平均评分</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {favoriteMCPs.reduce((sum, mcp) => sum + mcp.users, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">总用户数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">30</p>
                  <p className="text-sm text-muted-foreground">天前更新</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 收藏列表 */}
        <div className="space-y-4">
          {sortedMCPs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无收藏</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "没有找到匹配的收藏" : "您还没有收藏任何MCP"}
                </p>
                <Button>浏览MCP市场</Button>
              </CardContent>
            </Card>
          ) : (
            sortedMCPs.map((mcp) => (
              <Card key={mcp.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mcp.avatar} alt={mcp.name} />
                        <AvatarFallback>{mcp.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{mcp.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {mcp.description}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="secondary">{mcp.category}</Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{mcp.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{mcp.users.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mcp.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        查看详情
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveFavorite(mcp.id)}
                      >
                        <Heart className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                        取消收藏
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProfileLayout>
  )
}
