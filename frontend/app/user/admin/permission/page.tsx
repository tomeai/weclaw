"use client"

import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

// ============ 类型定义 ============

interface Role {
  id: number
  name: string
  status: 0 | 1
  remark: string
  created_time: string
  updated_time: string | null
  user_count: number
  permissions: string[]
}

// 系统权限定义
const SYSTEM_PERMISSIONS = [
  {
    group: "MCP管理",
    permissions: [
      { key: "mcp:view", label: "查看MCP" },
      { key: "mcp:create", label: "创建MCP" },
      { key: "mcp:edit", label: "编辑MCP" },
      { key: "mcp:delete", label: "删除MCP" },
      { key: "mcp:audit", label: "审核MCP" },
    ],
  },
  {
    group: "Agent管理",
    permissions: [
      { key: "agent:view", label: "查看Agent" },
      { key: "agent:create", label: "创建Agent" },
      { key: "agent:edit", label: "编辑Agent" },
      { key: "agent:delete", label: "删除Agent" },
    ],
  },
  {
    group: "用户管理",
    permissions: [
      { key: "user:view", label: "查看用户" },
      { key: "user:edit", label: "编辑用户" },
      { key: "user:disable", label: "禁用用户" },
      { key: "user:role", label: "分配角色" },
    ],
  },
  {
    group: "系统设置",
    permissions: [
      { key: "system:category", label: "分类管理" },
      { key: "system:config", label: "系统配置" },
      { key: "system:log", label: "操作日志" },
    ],
  },
]

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: 1,
    name: "超级管理员",
    status: 1,
    remark: "拥有系统所有权限，不可删除",
    created_time: "2024-01-01T00:00:00",
    updated_time: null,
    user_count: 1,
    permissions: SYSTEM_PERMISSIONS.flatMap((g) =>
      g.permissions.map((p) => p.key)
    ),
  },
  {
    id: 2,
    name: "运营管理员",
    status: 1,
    remark: "负责MCP和Agent的审核和管理",
    created_time: "2024-01-05T10:00:00",
    updated_time: "2024-02-01T14:30:00",
    user_count: 3,
    permissions: [
      "mcp:view",
      "mcp:edit",
      "mcp:audit",
      "agent:view",
      "agent:edit",
      "user:view",
      "system:category",
    ],
  },
  {
    id: 3,
    name: "内容审核员",
    status: 1,
    remark: "负责MCP和Agent内容审核",
    created_time: "2024-01-10T09:00:00",
    updated_time: null,
    user_count: 5,
    permissions: ["mcp:view", "mcp:audit", "agent:view"],
  },
  {
    id: 4,
    name: "开发者",
    status: 1,
    remark: "可以创建和管理自己的MCP和Agent",
    created_time: "2024-01-15T14:00:00",
    updated_time: "2024-01-20T11:00:00",
    user_count: 128,
    permissions: [
      "mcp:view",
      "mcp:create",
      "mcp:edit",
      "agent:view",
      "agent:create",
      "agent:edit",
    ],
  },
  {
    id: 5,
    name: "访客",
    status: 0,
    remark: "已禁用的临时角色",
    created_time: "2024-02-01T16:00:00",
    updated_time: "2024-02-03T10:00:00",
    user_count: 0,
    permissions: ["mcp:view", "agent:view"],
  },
]

export default function PermissionsAdminPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("all")

  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    status: 1 as 0 | 1,
    remark: "",
    permissions: [] as string[],
  })

  const totalRoles = roles.length
  const activeRoles = roles.filter((r) => r.status === 1).length
  const totalPermissions = SYSTEM_PERMISSIONS.reduce(
    (sum, g) => sum + g.permissions.length,
    0
  )
  const totalAssignedUsers = roles.reduce((sum, r) => sum + r.user_count, 0)

  // 筛选
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      searchKeyword === "" ||
      role.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      role.remark.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || role.status.toString() === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleSearch = () => {
    // 前端筛选，无需额外操作
  }

  const handleReset = () => {
    setSearchKeyword("")
    setStatusFilter("all")
  }

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingRole(null)
    setFormData({ name: "", status: 1, remark: "", permissions: [] })
    setDialogOpen(true)
  }

  // 打开编辑弹窗
  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      status: role.status,
      remark: role.remark,
      permissions: [...role.permissions],
    })
    setDialogOpen(true)
  }

  // 切换权限选中
  const togglePermission = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }))
  }

  // 切换整组权限
  const toggleGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every((p) =>
      formData.permissions.includes(p)
    )
    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !groupPermissions.includes(p))
        : [
            ...new Set([...prev.permissions, ...groupPermissions]),
          ],
    }))
  }

  // 保存角色
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("请输入角色名称")
      return
    }

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                name: formData.name,
                status: formData.status,
                remark: formData.remark,
                permissions: formData.permissions,
                updated_time: new Date().toISOString(),
              }
            : r
        )
      )
      toast.success("角色更新成功")
    } else {
      const newRole: Role = {
        id: Math.max(...roles.map((r) => r.id)) + 1,
        name: formData.name,
        status: formData.status,
        remark: formData.remark,
        created_time: new Date().toISOString(),
        updated_time: null,
        user_count: 0,
        permissions: formData.permissions,
      }
      setRoles((prev) => [...prev, newRole])
      toast.success("角色创建成功")
    }

    setDialogOpen(false)
  }

  // 删除角色
  const handleDelete = (role: Role) => {
    if (role.id === 1) {
      toast.error("超级管理员角色不可删除")
      return
    }
    if (role.user_count > 0) {
      toast.error("该角色下仍有用户，请先移除用户后再删除")
      return
    }
    setRoles((prev) => prev.filter((r) => r.id !== role.id))
    toast.success("角色已删除")
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">权限管理</h1>
            <p className="text-muted-foreground">
              管理系统角色和权限分配，控制用户访问权限
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
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增角色
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalRoles}</p>
                  <p className="text-muted-foreground text-sm">总角色数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{activeRoles}</p>
                  <p className="text-muted-foreground text-sm">启用角色</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{totalPermissions}</p>
                  <p className="text-muted-foreground text-sm">权限项</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{totalAssignedUsers}</p>
                  <p className="text-muted-foreground text-sm">已分配用户</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles" className="gap-1.5">
              <Shield className="h-4 w-4" />
              角色管理
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-1.5">
              <KeyRound className="h-4 w-4" />
              权限总览
            </TabsTrigger>
          </TabsList>

          {/* ========== 角色管理 Tab ========== */}
          <TabsContent value="roles" className="mt-4 space-y-4">
            {/* 搜索和筛选 */}
            <Card>
              <CardHeader>
                <CardTitle>搜索和筛选</CardTitle>
                <CardDescription>根据角色名称或状态筛选角色</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="搜索角色名称或备注..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-10"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSearch()
                        }
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
                      <SelectValue placeholder="角色状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="1">启用</SelectItem>
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

            {/* 角色列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>角色列表</span>
                  <span className="text-muted-foreground text-sm font-normal">
                    共 {filteredRoles.length} 个角色
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                    加载中...
                  </div>
                ) : filteredRoles.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Shield className="mx-auto mb-4 h-12 w-12" />
                    <p>暂无匹配的角色</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>角色名称</TableHead>
                        <TableHead>备注</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>权限数</TableHead>
                        <TableHead>用户数</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>更新时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{role.name}</span>
                              {role.id === 1 && (
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  内置
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-muted-foreground max-w-xs truncate text-sm"
                              title={role.remark}
                            >
                              {role.remark || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {role.status === 1 ? (
                              <Badge className="bg-green-100 text-green-700">
                                启用
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700">
                                禁用
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {role.permissions.length} 项
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              {role.user_count}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(role.created_time)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(role.updated_time)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(role)}
                                disabled={role.id === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== 权限总览 Tab ========== */}
          <TabsContent value="permissions" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {SYSTEM_PERMISSIONS.map((group) => (
                <Card key={group.group}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{group.group}</CardTitle>
                    <CardDescription>
                      {group.permissions.length} 项权限
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.permissions.map((perm) => {
                        const assignedRoles = roles.filter(
                          (r) =>
                            r.status === 1 &&
                            r.permissions.includes(perm.key)
                        )
                        return (
                          <div
                            key={perm.key}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {perm.label}
                              </p>
                              <p className="font-mono text-muted-foreground text-xs">
                                {perm.key}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {assignedRoles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {assignedRoles.slice(0, 3).map((role) => (
                                    <Badge
                                      key={role.id}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {role.name}
                                    </Badge>
                                  ))}
                                  {assignedRoles.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{assignedRoles.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  未分配
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ========== 新增/编辑角色弹窗 ========== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "编辑角色" : "新增角色"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "修改角色信息和权限分配"
                : "创建新角色并分配权限"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">角色名称 *</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="请输入角色名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-remark">备注说明</Label>
                <Textarea
                  id="role-remark"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                  placeholder="请输入角色描述"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-muted-foreground text-sm">
                    禁用后该角色下的用户将失去对应权限
                  </p>
                </div>
                <Switch
                  checked={formData.status === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: checked ? 1 : 0,
                    }))
                  }
                />
              </div>
            </div>

            {/* 权限分配 */}
            <div className="space-y-3">
              <Label>权限分配</Label>
              <p className="text-muted-foreground text-sm">
                已选择 {formData.permissions.length} / {totalPermissions} 项权限
              </p>
              <div className="space-y-4">
                {SYSTEM_PERMISSIONS.map((group) => {
                  const groupKeys = group.permissions.map((p) => p.key)
                  const allSelected = groupKeys.every((k) =>
                    formData.permissions.includes(k)
                  )

                  return (
                    <div key={group.group} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {group.group}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleGroup(groupKeys)}
                        >
                          {allSelected ? "取消全选" : "全选"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.permissions.map((perm) => {
                          const isChecked = formData.permissions.includes(
                            perm.key
                          )
                          return (
                            <div
                              key={perm.key}
                              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                                isChecked
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => togglePermission(perm.key)}
                            >
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded border ${
                                  isChecked
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/30"
                                }`}
                              >
                                {isChecked && (
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
                              {perm.label}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingRole ? "保存修改" : "创建角色"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
