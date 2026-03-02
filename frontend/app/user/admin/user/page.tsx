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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  getAllSysRoles,
  getSysUsers,
  resetSysUserPassword,
  SysRoleDetail,
  SysUserDetail,
  updateSysUser,
  updateUserPermission,
} from "@/lib/admin-sys"
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export default function UsersAdminPage() {
  const [users, setUsers] = useState<SysUserDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // 搜索条件
  const [searchUsername, setSearchUsername] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // 统计
  const [statsTotal, setStatsTotal] = useState(0)
  const [statsActive, setStatsActive] = useState(0)
  const [statsStaff, setStatsStaff] = useState(0)
  const [statsSuperuser, setStatsSuperuser] = useState(0)

  // 所有角色（用于编辑分配）
  const [allRoles, setAllRoles] = useState<SysRoleDetail[]>([])

  // 详情弹窗
  const [detailUser, setDetailUser] = useState<SysUserDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // 编辑弹窗
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SysUserDetail | null>(null)
  const [editForm, setEditForm] = useState({
    username: "",
    nickname: "",
    email: "",
    phone: "",
    roles: [] as number[],
  })
  const [editSaving, setEditSaving] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)

  // 重置密码弹窗
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdUser, setPwdUser] = useState<SysUserDetail | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [pwdSaving, setPwdSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSysUsers({
        page: currentPage,
        size: pageSize,
        username: searchUsername || undefined,
        status: statusFilter !== "all" ? Number(statusFilter) : undefined,
      })
      setUsers(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch {
      // error handled by http interceptor
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchUsername, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const [allData, activeData, staffData] = await Promise.all([
        getSysUsers({ page: 1, size: 1 }),
        getSysUsers({ page: 1, size: 1, status: 1 }),
        getSysUsers({ page: 1, size: 200, status: 1 }),
      ])
      setStatsTotal(allData.total)
      setStatsActive(activeData.total)
      const staffCount = staffData.items.filter((u) => u.is_staff).length
      const superuserCount = staffData.items.filter(
        (u) => u.is_superuser
      ).length
      setStatsStaff(staffCount)
      setStatsSuperuser(superuserCount)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const handleReset = () => {
    setSearchUsername("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchUsers()
    fetchStats()
  }

  // 查看详情
  const handleViewDetail = (user: SysUserDetail) => {
    setDetailUser(user)
    setDetailOpen(true)
  }

  // 打开编辑弹窗（同时刷新角色列表）
  const handleEdit = async (user: SysUserDetail) => {
    setEditingUser(user)
    setEditForm({
      username: user.username,
      nickname: user.nickname,
      email: user.email ?? "",
      phone: user.phone ?? "",
      roles: user.roles.map((r) => r.id),
    })
    setEditOpen(true)
    setRolesLoading(true)
    try {
      const roles = await getAllSysRoles()
      setAllRoles(roles)
    } catch {
      // handled by interceptor
    } finally {
      setRolesLoading(false)
    }
  }

  // 保存编辑
  const handleEditSave = async () => {
    if (!editingUser) return
    if (!editForm.username.trim() || !editForm.nickname.trim()) {
      toast.error("用户名和昵称不能为空")
      return
    }
    setEditSaving(true)
    try {
      await updateSysUser(editingUser.id, {
        username: editForm.username,
        nickname: editForm.nickname,
        email: editForm.email || null,
        phone: editForm.phone || null,
        roles: editForm.roles,
      })
      toast.success("用户信息已更新")
      setEditOpen(false)
      fetchUsers()
    } catch {
      // error handled by http interceptor
    } finally {
      setEditSaving(false)
    }
  }

  // 切换用户状态
  const handleToggleStatus = async (user: SysUserDetail) => {
    try {
      await updateUserPermission(user.id, "status")
      toast.success(
        user.status === 1 ? "用户已禁用" : "用户已启用"
      )
      fetchUsers()
      fetchStats()
    } catch {
      // error handled by http interceptor
    }
  }

  // 切换管理员权限
  const handleToggleStaff = async (user: SysUserDetail) => {
    if (user.is_superuser) {
      toast.error("超级管理员不可操作")
      return
    }
    try {
      await updateUserPermission(user.id, "staff")
      toast.success(user.is_staff ? "已取消管理员权限" : "已设为管理员")
      fetchUsers()
      fetchStats()
    } catch {
      // error handled by http interceptor
    }
  }

  // 打开重置密码弹窗
  const handleOpenResetPwd = (user: SysUserDetail) => {
    setPwdUser(user)
    setNewPassword("")
    setPwdOpen(true)
  }

  // 重置密码
  const handleResetPassword = async () => {
    if (!pwdUser) return
    if (!newPassword || newPassword.length < 6) {
      toast.error("密码至少 6 位")
      return
    }
    setPwdSaving(true)
    try {
      await resetSysUserPassword(pwdUser.id, newPassword)
      toast.success("密码重置成功")
      setPwdOpen(false)
    } catch {
      // error handled by http interceptor
    } finally {
      setPwdSaving(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  const getRoleBadge = (user: SysUserDetail) => {
    if (user.is_superuser) {
      return (
        <Badge className="bg-red-100 text-red-700">超级管理员</Badge>
      )
    }
    if (user.is_staff) {
      return (
        <Badge className="bg-blue-100 text-blue-700">管理员</Badge>
      )
    }
    return <Badge variant="secondary">普通用户</Badge>
  }

  const getStatusBadge = (status: 0 | 1) => {
    if (status === 1) {
      return (
        <Badge className="bg-green-100 text-green-700">正常</Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-700">禁用</Badge>
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
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{statsTotal}</p>
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
                  <p className="text-2xl font-bold">{statsActive}</p>
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
                  <p className="text-2xl font-bold">{statsStaff}</p>
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
                  <p className="text-2xl font-bold">{statsSuperuser}</p>
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
              根据用户名或状态筛选用户
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="搜索用户名..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "0" | "1") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="用户状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="1">正常</SelectItem>
                  <SelectItem value="0">禁用</SelectItem>
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
                共 {total} 个用户
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : users.length === 0 ? (
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
                      <TableHead>分配角色</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead>最后登录</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatar ?? undefined}
                                alt={user.nickname}
                              />
                              <AvatarFallback className="text-xs">
                                {user.nickname.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.nickname}</div>
                              <div className="text-muted-foreground text-xs">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.email ?? "-"}
                        </TableCell>
                        <TableCell>{getRoleBadge(user)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length === 0 ? (
                              <span className="text-muted-foreground text-xs">
                                未分配
                              </span>
                            ) : (
                              user.roles.slice(0, 2).map((r) => (
                                <Badge
                                  key={r.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {r.name}
                                </Badge>
                              ))
                            )}
                            {user.roles.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{user.roles.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.join_time)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.last_login_time)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              title="查看详情"
                              onClick={() => handleViewDetail(user)}
                            >
                              详情
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="编辑用户"
                              onClick={() => handleEdit(user)}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="重置密码"
                              onClick={() => handleOpenResetPwd(user)}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                user.status === 1
                                  ? "text-destructive hover:text-destructive"
                                  : "text-green-600 hover:text-green-700"
                              }
                              title={user.status === 1 ? "禁用用户" : "启用用户"}
                              onClick={() => handleToggleStatus(user)}
                              disabled={user.is_superuser}
                            >
                              {user.status === 1 ? "禁用" : "启用"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                      第 {currentPage} 页，共 {totalPages} 页，共 {total} 条
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
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

      {/* ========== 用户详情弹窗 ========== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>查看用户基本信息</DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={detailUser.avatar ?? undefined}
                    alt={detailUser.nickname}
                  />
                  <AvatarFallback className="text-xl">
                    {detailUser.nickname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{detailUser.nickname}</p>
                  <p className="text-muted-foreground text-sm">
                    @{detailUser.username}
                  </p>
                  <div className="mt-1 flex gap-2">
                    {getRoleBadge(detailUser)}
                    {getStatusBadge(detailUser.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">邮箱</p>
                  <p className="font-medium">{detailUser.email ?? "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">手机</p>
                  <p className="font-medium">{detailUser.phone ?? "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">多端登录</p>
                  <p className="font-medium">
                    {detailUser.is_multi_login ? "允许" : "不允许"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">注册时间</p>
                  <p className="font-medium">
                    {formatDate(detailUser.join_time)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">最后登录</p>
                  <p className="font-medium">
                    {formatDate(detailUser.last_login_time)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">分配角色</p>
                  <div className="flex flex-wrap gap-1">
                    {detailUser.roles.length === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        未分配角色
                      </span>
                    ) : (
                      detailUser.roles.map((r) => (
                        <Badge key={r.id} variant="outline">
                          {r.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              关闭
            </Button>
            {detailUser && (
              <Button
                onClick={() => {
                  setDetailOpen(false)
                  handleEdit(detailUser)
                }}
              >
                编辑用户
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 编辑用户弹窗 ========== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户基本信息并分配系统角色权限
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>用户名 *</Label>
                <Input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="用户名"
                />
              </div>
              <div className="space-y-1.5">
                <Label>昵称 *</Label>
                <Input
                  value={editForm.nickname}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, nickname: e.target.value }))
                  }
                  placeholder="昵称"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>邮箱</Label>
              <Input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="邮箱地址"
                type="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label>手机号</Label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="手机号"
              />
            </div>

            {/* 角色权限分配 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>角色权限分配</Label>
                <span className="text-muted-foreground text-xs">
                  已选 {editForm.roles.length} 个角色
                </span>
              </div>
              {rolesLoading ? (
                <div className="flex items-center justify-center rounded-md border py-6">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    加载角色列表...
                  </span>
                </div>
              ) : allRoles.filter((r) => r.status === 1).length === 0 ? (
                <div className="text-muted-foreground rounded-md border p-3 text-sm">
                  暂无可用角色
                </div>
              ) : (
                <div className="space-y-1.5 rounded-md border p-3">
                  {allRoles
                    .filter((r) => r.status === 1)
                    .map((r) => {
                      const selected = editForm.roles.includes(r.id)
                      return (
                        <div
                          key={r.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary/5 text-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() =>
                            setEditForm((p) => ({
                              ...p,
                              roles: selected
                                ? p.roles.filter((id) => id !== r.id)
                                : [...p.roles, r.id],
                            }))
                          }
                        >
                          <div
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {selected && (
                              <svg
                                className="h-3 w-3"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2 6L5 9L10 3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{r.name}</span>
                            {r.remark && (
                              <span className="text-muted-foreground ml-2 text-xs">
                                {r.remark}
                              </span>
                            )}
                          </div>
                          <Shield className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving || rolesLoading}>
              {editSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 重置密码弹窗 ========== */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为用户 <strong>{pwdUser?.nickname}</strong> 设置新密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>新密码</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少 6 位）"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdOpen(false)}>
              取消
            </Button>
            <Button onClick={handleResetPassword} disabled={pwdSaving}>
              {pwdSaving ? "重置中..." : "确认重置"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
