"use client"

import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"
import { useState } from "react"

type UserStatus = "active" | "inactive"

interface AdminUserItem {
  id: number
  uuid: string
  username: string
  nickname: string
  avatar: string | null
  email: string | null
  phone: string | null
  status: UserStatus
  is_superuser: boolean
  is_staff: boolean
  is_multi_login: boolean
  join_time: string
  last_login_time: string | null
  mcp_count: number
  agent_count: number
}

// 模拟用户数据
const mockUsers: AdminUserItem[] = [
  {
    id: 1,
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    username: "zhangsan",
    nickname: "张三",
    avatar: null,
    email: "zhangsan@example.com",
    phone: "138****0001",
    status: "active",
    is_superuser: true,
    is_staff: true,
    is_multi_login: true,
    join_time: "2024-01-01T08:00:00",
    last_login_time: "2024-02-06T10:30:00",
    mcp_count: 5,
    agent_count: 2,
  },
  {
    id: 2,
    uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    username: "lisi",
    nickname: "李四",
    avatar: null,
    email: "lisi@example.com",
    phone: "139****0002",
    status: "active",
    is_superuser: false,
    is_staff: true,
    is_multi_login: false,
    join_time: "2024-01-10T14:20:00",
    last_login_time: "2024-02-05T16:45:00",
    mcp_count: 3,
    agent_count: 1,
  },
  {
    id: 3,
    uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    username: "wangwu",
    nickname: "王五",
    avatar: null,
    email: "wangwu@example.com",
    phone: null,
    status: "active",
    is_superuser: false,
    is_staff: false,
    is_multi_login: false,
    join_time: "2024-01-15T09:30:00",
    last_login_time: "2024-02-04T11:20:00",
    mcp_count: 1,
    agent_count: 0,
  },
  {
    id: 4,
    uuid: "d4e5f6a7-b8c9-0123-defa-234567890123",
    username: "zhaoliu",
    nickname: "赵六",
    avatar: null,
    email: "zhaoliu@example.com",
    phone: "137****0004",
    status: "inactive",
    is_superuser: false,
    is_staff: false,
    is_multi_login: false,
    join_time: "2024-01-20T16:00:00",
    last_login_time: "2024-01-25T08:10:00",
    mcp_count: 0,
    agent_count: 0,
  },
  {
    id: 5,
    uuid: "e5f6a7b8-c9d0-1234-efab-345678901234",
    username: "sunqi",
    nickname: "孙七",
    avatar: null,
    email: null,
    phone: "136****0005",
    status: "active",
    is_superuser: false,
    is_staff: false,
    is_multi_login: true,
    join_time: "2024-02-01T10:00:00",
    last_login_time: "2024-02-06T09:00:00",
    mcp_count: 2,
    agent_count: 1,
  },
]

export default function UsersAdminPage() {
  const [users] = useState<AdminUserItem[]>(mockUsers)
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")
  const [roleFilter, setRoleFilter] = useState<
    "all" | "superuser" | "staff" | "user"
  >("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const total = users.length
  const activeCount = users.filter((u) => u.status === "active").length
  const staffCount = users.filter((u) => u.is_staff).length
  const superuserCount = users.filter((u) => u.is_superuser).length

  // 筛选
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchKeyword === "" ||
      user.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (user.email &&
        user.email.toLowerCase().includes(searchKeyword.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "superuser" && user.is_superuser) ||
      (roleFilter === "staff" && user.is_staff && !user.is_superuser) ||
      (roleFilter === "user" && !user.is_staff && !user.is_superuser)

    return matchesSearch && matchesStatus && matchesRole
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchKeyword("")
    setStatusFilter("all")
    setRoleFilter("all")
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  const getRoleBadge = (user: AdminUserItem) => {
    if (user.is_superuser) {
      return (
        <Badge className="bg-red-100 text-red-700">
          超级管理员
        </Badge>
      )
    }
    if (user.is_staff) {
      return (
        <Badge className="bg-blue-100 text-blue-700">
          管理员
        </Badge>
      )
    }
    return <Badge variant="secondary">普通用户</Badge>
  }

  const getStatusBadge = (status: UserStatus) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-700">
          正常
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-700">
        禁用
      </Badge>
    )
  }

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
            <p className="text-muted-foreground">
              管理平台用户，查看用户信息和权限设置
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{total}</p>
                  <p className="text-muted-foreground text-sm">总用户数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-muted-foreground text-sm">活跃用户</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{staffCount}</p>
                  <p className="text-muted-foreground text-sm">管理员</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{superuserCount}</p>
                  <p className="text-muted-foreground text-sm">超级管理员</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>搜索和筛选</CardTitle>
            <CardDescription>
              根据用户名、邮箱、状态或角色筛选用户
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="搜索用户名、昵称或邮箱..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: UserStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="用户状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={roleFilter}
                onValueChange={(
                  value: "all" | "superuser" | "staff" | "user"
                ) => setRoleFilter(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="用户角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="superuser">超级管理员</SelectItem>
                  <SelectItem value="staff">管理员</SelectItem>
                  <SelectItem value="user">普通用户</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>用户列表</span>
              <span className="text-muted-foreground text-sm font-normal">
                共 {filteredUsers.length} 个用户
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <UserX className="mx-auto mb-4 h-12 w-12" />
                <p>暂无匹配的用户数据</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>用户信息</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>MCP / Agent</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead>最后登录</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatar || undefined}
                                alt={user.nickname}
                              />
                              <AvatarFallback className="text-xs">
                                {user.nickname.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.nickname}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.email || "-"}
                        </TableCell>
                        <TableCell>{getRoleBadge(user)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{user.mcp_count} MCP</span>
                            <span>/</span>
                            <span>{user.agent_count} Agent</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.join_time)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.last_login_time)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                      显示第 {(currentPage - 1) * pageSize + 1} 到{" "}
                      {Math.min(currentPage * pageSize, filteredUsers.length)}{" "}
                      条，共 {filteredUsers.length} 条记录
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        上一页
                      </Button>
                      <span className="text-sm">
                        第 {currentPage} 页，共 {totalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        下一页
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
