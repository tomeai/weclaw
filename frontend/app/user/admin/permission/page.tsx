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
  CreateSysMenuParam,
  CreateSysRoleParam,
  MenuType,
  SysMenuDetail,
  SysRoleDetail,
  createSysMenu,
  createSysRole,
  deleteSysMenu,
  deleteSysRoles,
  getRoleMenuTree,
  getSysMenus,
  getSysRoles,
  getSysUsers,
  updateRoleMenus,
  updateSysMenu,
  updateSysRole,
} from "@/lib/admin-sys"
import {
  Edit,
  FolderOpen,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

// ============ 常量 & 工具 ============

const PERM_TYPES = [0, 2]

interface PermGroup {
  id: number
  title: string
  permissions: SysMenuDetail[]
}

function buildPermGroups(menus: SysMenuDetail[]): PermGroup[] {
  const directories = menus.filter((m) => m.type === 0)
  const buttons = menus.filter((m) => m.type === 2)
  return directories
    .map((dir) => ({
      id: dir.id,
      title: dir.title,
      permissions: buttons.filter((b) => b.parent_id === dir.id),
    }))
    .filter((g) => g.permissions.length > 0)
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("zh-CN")
}

// ============ 主页面 ============

export default function PermissionsAdminPage() {
  // ---- 角色列表 ----
  const [roles, setRoles] = useState<SysRoleDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // ---- 统计 ----
  const [statsTotal, setStatsTotal] = useState(0)
  const [statsActive, setStatsActive] = useState(0)
  const [statsUsers, setStatsUsers] = useState(0)
  const [allPermMenus, setAllPermMenus] = useState<SysMenuDetail[]>([])

  // ---- 搜索 ----
  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("all")

  // ---- 角色弹窗（新增/编辑 + 权限分配合一）----
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<SysRoleDetail | null>(null)
  const [formData, setFormData] = useState<CreateSysRoleParam>({
    name: "",
    status: 1,
    remark: "",
  })
  const [saving, setSaving] = useState(false)
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<number>>(new Set())
  const [menuLoading, setMenuLoading] = useState(false)

  // ---- 删除弹窗 ----
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<SysRoleDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ---- 菜单节点 ----
  const [menuNodes, setMenuNodes] = useState<SysMenuDetail[]>([])
  const [menuNodesLoading, setMenuNodesLoading] = useState(false)
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<SysMenuDetail | null>(null)
  const [menuFormData, setMenuFormData] = useState({
    title: "",
    name: "",
    path: "",
    icon: "",
    perms: "",
    parent_id: null as number | null,
    sort: 0,
    status: 1 as 0 | 1,
    display: 1 as 0 | 1,
    cache: 0 as 0 | 1,
    type: 0 as MenuType,
  })
  const [menuSaving, setMenuSaving] = useState(false)
  const [menuDeleteOpen, setMenuDeleteOpen] = useState(false)
  const [deletingMenu, setDeletingMenu] = useState<SysMenuDetail | null>(null)
  const [menuDeleting, setMenuDeleting] = useState(false)

  // 权限分组（目录 → 按钮）
  const permGroups = buildPermGroups(allPermMenus)
  const totalPermissions = allPermMenus.filter((m) => m.type === 2).length

  // ============ 数据获取 ============

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSysRoles({
        page: currentPage,
        size: pageSize,
        name: searchName || undefined,
        status: statusFilter !== "all" ? Number(statusFilter) : undefined,
      })
      setRoles(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchName, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const [allData, activeData, usersData, permMenus] = await Promise.all([
        getSysRoles({ page: 1, size: 1 }),
        getSysRoles({ page: 1, size: 1, status: 1 }),
        getSysUsers({ page: 1, size: 1 }),
        getSysMenus(PERM_TYPES),
      ])
      setStatsTotal(allData.total)
      setStatsActive(activeData.total)
      setStatsUsers(usersData.total)
      setAllPermMenus(permMenus)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const fetchMenuNodes = useCallback(async () => {
    setMenuNodesLoading(true)
    try {
      const menus = await getSysMenus(PERM_TYPES)
      setMenuNodes(menus)
    } catch {
      // handled by interceptor
    } finally {
      setMenuNodesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenuNodes()
  }, [fetchMenuNodes])

  // ============ 事件处理 ============

  const handleRefresh = () => {
    fetchRoles()
    fetchStats()
    fetchMenuNodes()
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchRoles()
  }

  const handleReset = () => {
    setSearchName("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  // 新增角色
  const handleAdd = async () => {
    setEditingRole(null)
    setFormData({ name: "", status: 1, remark: "" })
    setSelectedMenuIds(new Set())
    setMenuLoading(true)
    setDialogOpen(true)
    try {
      const menus = await getSysMenus(PERM_TYPES)
      setAllPermMenus(menus)
    } catch {
      // handled by interceptor
    } finally {
      setMenuLoading(false)
    }
  }

  // 编辑角色（同时加载已分配权限）
  const handleEdit = async (role: SysRoleDetail) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      status: role.status,
      remark: role.remark ?? "",
    })
    setSelectedMenuIds(new Set())
    setMenuLoading(true)
    setDialogOpen(true)
    try {
      const [menus, roleMenus] = await Promise.all([
        getSysMenus(PERM_TYPES),
        getRoleMenuTree(role.id),
      ])
      setAllPermMenus(menus)
      const collectIds = (items: SysMenuDetail[]): number[] => {
        const ids: number[] = []
        for (const item of items) {
          ids.push(item.id)
          if (item.children?.length) ids.push(...collectIds(item.children))
        }
        return ids
      }
      setSelectedMenuIds(new Set(collectIds(roleMenus)))
    } catch {
      // handled by interceptor
    } finally {
      setMenuLoading(false)
    }
  }

  // 切换单项权限
  const togglePermission = (menuId: number) => {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev)
      if (next.has(menuId)) {
        next.delete(menuId)
      } else {
        next.add(menuId)
      }
      return next
    })
  }

  // 切换整组权限（目录 + 该组所有按钮）
  const toggleGroup = (group: PermGroup) => {
    const allIds = [group.id, ...group.permissions.map((p) => p.id)]
    const allSelected = allIds.every((id) => selectedMenuIds.has(id))
    setSelectedMenuIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        allIds.forEach((id) => next.delete(id))
      } else {
        allIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  // 保存角色（基本信息 + 权限分配）
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("请输入角色名称")
      return
    }
    setSaving(true)
    try {
      const payload: CreateSysRoleParam = {
        name: formData.name.trim(),
        status: formData.status,
        remark: formData.remark || null,
      }
      if (editingRole) {
        await updateSysRole(editingRole.id, payload)
        await updateRoleMenus(editingRole.id, Array.from(selectedMenuIds))
        toast.success("角色更新成功")
      } else {
        await createSysRole(payload)
        // 创建后查找新角色 ID，再分配权限
        if (selectedMenuIds.size > 0) {
          const fresh = await getSysRoles({ name: payload.name, size: 5 })
          const newRole = fresh.items.find((r) => r.name === payload.name)
          if (newRole) {
            await updateRoleMenus(newRole.id, Array.from(selectedMenuIds))
          }
        }
        toast.success("角色创建成功")
      }
      setDialogOpen(false)
      fetchRoles()
      fetchStats()
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  // 删除确认
  const handleDeleteConfirm = (role: SysRoleDetail) => {
    setDeletingRole(role)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingRole) return
    setDeleting(true)
    try {
      await deleteSysRoles([deletingRole.id])
      toast.success("角色已删除")
      setDeleteOpen(false)
      fetchRoles()
      fetchStats()
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false)
    }
  }

  // 菜单节点事件处理
  const handleAddMenu = (type: MenuType, parentId?: number) => {
    setEditingMenu(null)
    setMenuFormData({
      title: "",
      name: "",
      path: "",
      icon: "",
      perms: "",
      parent_id: parentId ?? null,
      sort: 0,
      status: 1,
      display: 1,
      cache: 0,
      type,
    })
    setMenuDialogOpen(true)
  }

  const handleEditMenu = (menu: SysMenuDetail) => {
    setEditingMenu(menu)
    setMenuFormData({
      title: menu.title,
      name: menu.name,
      path: menu.path ?? "",
      icon: menu.icon ?? "",
      perms: menu.perms ?? "",
      parent_id: menu.parent_id,
      sort: menu.sort,
      status: menu.status,
      display: menu.display,
      cache: menu.cache,
      type: menu.type,
    })
    setMenuDialogOpen(true)
  }

  const handleSaveMenu = async () => {
    if (!menuFormData.title.trim()) {
      toast.error("请输入菜单标题")
      return
    }
    if (!menuFormData.name.trim()) {
      toast.error("请输入菜单标识")
      return
    }
    setMenuSaving(true)
    try {
      const payload: CreateSysMenuParam = {
        title: menuFormData.title.trim(),
        name: menuFormData.name.trim(),
        type: menuFormData.type,
        status: menuFormData.status,
        display: menuFormData.display,
        cache: menuFormData.cache,
        sort: menuFormData.sort,
        path: menuFormData.path || null,
        icon: menuFormData.icon || null,
        perms: menuFormData.perms || null,
        parent_id: menuFormData.parent_id,
      }
      if (editingMenu) {
        await updateSysMenu(editingMenu.id, payload)
        toast.success("菜单更新成功")
      } else {
        await createSysMenu(payload)
        toast.success("菜单创建成功")
      }
      setMenuDialogOpen(false)
      fetchMenuNodes()
      fetchStats()
    } catch {
      // handled by interceptor
    } finally {
      setMenuSaving(false)
    }
  }

  const handleDeleteMenuConfirm = (menu: SysMenuDetail) => {
    setDeletingMenu(menu)
    setMenuDeleteOpen(true)
  }

  const handleDeleteMenu = async () => {
    if (!deletingMenu) return
    setMenuDeleting(true)
    try {
      await deleteSysMenu(deletingMenu.id)
      toast.success("菜单已删除")
      setMenuDeleteOpen(false)
      fetchMenuNodes()
      fetchStats()
    } catch {
      // handled by interceptor
    } finally {
      setMenuDeleting(false)
    }
  }

  // ============ 渲染 ============

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
                  <p className="text-2xl font-bold">{statsTotal}</p>
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
                  <p className="text-2xl font-bold">{statsActive}</p>
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
                  <p className="text-2xl font-bold">{statsUsers}</p>
                  <p className="text-muted-foreground text-sm">平台总用户</p>
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
            <TabsTrigger value="menus" className="gap-1.5">
              <FolderOpen className="h-4 w-4" />
              菜单节点
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
                        placeholder="搜索角色名称..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
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
                    共 {total} 个角色
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                    加载中...
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Shield className="mx-auto mb-4 h-12 w-12" />
                    <p>暂无匹配的角色</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>角色名称</TableHead>
                          <TableHead>备注</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead>更新时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              {role.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Shield className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{role.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className="text-muted-foreground max-w-xs truncate text-sm"
                                title={role.remark ?? ""}
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
                                  onClick={() => handleDeleteConfirm(role)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                          第 {currentPage} 页，共 {totalPages} 页，共 {total}{" "}
                          条
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage <= 1}
                          >
                            上一页
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(totalPages, p + 1)
                              )
                            }
                            disabled={currentPage >= totalPages}
                          >
                            下一页
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== 权限总览 Tab ========== */}
          <TabsContent value="permissions" className="mt-4">
            {permGroups.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                <KeyRound className="mx-auto mb-4 h-12 w-12" />
                <p>暂无权限节点，请先添加目录和按钮类型的菜单</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {permGroups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{group.title}</CardTitle>
                      <CardDescription>
                        {group.permissions.length} 项权限
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {group.permissions.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {perm.title}
                              </p>
                              <p className="text-muted-foreground font-mono text-xs">
                                {perm.perms || perm.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {perm.status === 1 ? (
                                <Badge className="bg-green-100 text-xs text-green-700">
                                  启用
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-xs text-gray-700">
                                  禁用
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ========== 菜单节点 Tab ========== */}
          <TabsContent value="menus" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">菜单节点管理</h2>
                <p className="text-muted-foreground text-sm">
                  管理目录和按钮权限节点
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchMenuNodes}
                  disabled={menuNodesLoading}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${menuNodesLoading ? "animate-spin" : ""}`}
                  />
                  刷新
                </Button>
                <Button onClick={() => handleAddMenu(0)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增目录
                </Button>
              </div>
            </div>

            {menuNodesLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : menuNodes.filter((m) => m.type === 0).length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                <FolderOpen className="mx-auto mb-4 h-12 w-12" />
                <p>暂无菜单节点，点击「新增目录」开始创建</p>
              </div>
            ) : (
              <div className="space-y-4">
                {menuNodes
                  .filter((m) => m.type === 0)
                  .sort((a, b) => a.sort - b.sort || a.id - b.id)
                  .map((dir) => {
                    const buttons = menuNodes
                      .filter((m) => m.type === 2 && m.parent_id === dir.id)
                      .sort((a, b) => a.sort - b.sort || a.id - b.id)
                    return (
                      <Card key={dir.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-blue-500" />
                              <CardTitle className="text-base">
                                {dir.title}
                              </CardTitle>
                              {dir.status === 1 ? (
                                <Badge className="bg-green-100 text-xs text-green-700">
                                  启用
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-xs text-gray-700">
                                  禁用
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddMenu(2, dir.id)}
                                title="新增按钮权限"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMenu(dir)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMenuConfirm(dir)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="flex gap-4 text-xs">
                            {dir.icon && <span>图标: {dir.icon}</span>}
                            <span>路由: {dir.path || "-"}</span>
                            <span>排序: {dir.sort}</span>
                          </CardDescription>
                        </CardHeader>
                        {buttons.length > 0 && (
                          <CardContent>
                            <div className="space-y-2">
                              {buttons.map((btn) => (
                                <div
                                  key={btn.id}
                                  className="flex items-center justify-between rounded-lg border p-3"
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {btn.title}
                                    </p>
                                    <p className="text-muted-foreground font-mono text-xs">
                                      {btn.perms || btn.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {btn.status === 1 ? (
                                      <Badge className="bg-green-100 text-xs text-green-700">
                                        启用
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-gray-100 text-xs text-gray-700">
                                        禁用
                                      </Badge>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditMenu(btn)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() =>
                                        handleDeleteMenuConfirm(btn)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                        {buttons.length === 0 && (
                          <CardContent>
                            <p className="text-muted-foreground text-xs">
                              暂无按钮权限，点击 + 新增
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ========== 新增/编辑角色弹窗 ========== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? "编辑角色" : "新增角色"}</DialogTitle>
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
                  value={formData.remark ?? ""}
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
              {menuLoading ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  加载权限列表...
                </div>
              ) : permGroups.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  暂无可分配的权限节点
                </p>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    已选择 {selectedMenuIds.size} / {totalPermissions} 项权限
                  </p>
                  <div className="space-y-4">
                    {permGroups.map((group) => {
                      const allIds = [
                        group.id,
                        ...group.permissions.map((p) => p.id),
                      ]
                      const allSelected = allIds.every((id) =>
                        selectedMenuIds.has(id)
                      )
                      return (
                        <div
                          key={group.id}
                          className="rounded-lg border p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {group.title}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => toggleGroup(group)}
                            >
                              {allSelected ? "取消全选" : "全选"}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {group.permissions.map((perm) => {
                              const isChecked = selectedMenuIds.has(perm.id)
                              return (
                                <div
                                  key={perm.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                                    isChecked
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() => togglePermission(perm.id)}
                                >
                                  <div
                                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
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
                                  <span className="truncate">{perm.title}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving || menuLoading}>
              {saving
                ? "保存中..."
                : editingRole
                  ? "保存修改"
                  : "创建角色"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 删除确认弹窗 ========== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除角色 <strong>{deletingRole?.name}</strong>{" "}
              吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 菜单节点新增/编辑弹窗 ========== */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? "编辑菜单节点" : "新增菜单节点"}
            </DialogTitle>
            <DialogDescription>
              {menuFormData.type === 0
                ? "目录节点显示在侧边栏导航中"
                : "按钮节点用于接口访问控制"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 节点类型（新增时可切换） */}
            {!editingMenu && (
              <div className="space-y-2">
                <Label>节点类型</Label>
                <Select
                  value={String(menuFormData.type)}
                  onValueChange={(v) =>
                    setMenuFormData((prev) => ({
                      ...prev,
                      type: Number(v) as MenuType,
                      parent_id: null,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">目录（侧边栏）</SelectItem>
                    <SelectItem value="2">按钮（权限）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 标题 */}
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                value={menuFormData.title}
                onChange={(e) =>
                  setMenuFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="显示名称"
              />
            </div>

            {/* 标识 */}
            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={menuFormData.name}
                onChange={(e) =>
                  setMenuFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="唯一标识符（英文）"
              />
            </div>

            {/* 路由路径（仅目录） */}
            {menuFormData.type === 0 && (
              <div className="space-y-2">
                <Label>路由路径</Label>
                <Input
                  value={menuFormData.path}
                  onChange={(e) =>
                    setMenuFormData((prev) => ({
                      ...prev,
                      path: e.target.value,
                    }))
                  }
                  placeholder="/user/admin/xxx"
                />
              </div>
            )}

            {/* 图标（仅目录） */}
            {menuFormData.type === 0 && (
              <div className="space-y-2">
                <Label>图标名称</Label>
                <Input
                  value={menuFormData.icon}
                  onChange={(e) =>
                    setMenuFormData((prev) => ({
                      ...prev,
                      icon: e.target.value,
                    }))
                  }
                  placeholder="如: Shield, Settings, Users, Database..."
                />
              </div>
            )}

            {/* 权限标识（仅按钮） */}
            {menuFormData.type === 2 && (
              <div className="space-y-2">
                <Label>权限标识</Label>
                <Input
                  value={menuFormData.perms}
                  onChange={(e) =>
                    setMenuFormData((prev) => ({
                      ...prev,
                      perms: e.target.value,
                    }))
                  }
                  placeholder="如: sys:user:list"
                />
              </div>
            )}

            {/* 所属目录（仅按钮） */}
            {menuFormData.type === 2 && (
              <div className="space-y-2">
                <Label>所属目录</Label>
                <Select
                  value={
                    menuFormData.parent_id
                      ? String(menuFormData.parent_id)
                      : "none"
                  }
                  onValueChange={(v) =>
                    setMenuFormData((prev) => ({
                      ...prev,
                      parent_id: v === "none" ? null : Number(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择所属目录" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（顶级）</SelectItem>
                    {menuNodes
                      .filter((m) => m.type === 0)
                      .map((dir) => (
                        <SelectItem key={dir.id} value={String(dir.id)}>
                          {dir.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 排序 */}
            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={menuFormData.sort}
                onChange={(e) =>
                  setMenuFormData((prev) => ({
                    ...prev,
                    sort: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            {/* 启用状态 */}
            <div className="flex items-center justify-between">
              <Label>启用状态</Label>
              <Switch
                checked={menuFormData.status === 1}
                onCheckedChange={(checked) =>
                  setMenuFormData((prev) => ({
                    ...prev,
                    status: checked ? 1 : 0,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMenuDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveMenu} disabled={menuSaving}>
              {menuSaving
                ? "保存中..."
                : editingMenu
                  ? "保存修改"
                  : "创建菜单"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 菜单节点删除确认弹窗 ========== */}
      <Dialog open={menuDeleteOpen} onOpenChange={setMenuDeleteOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除菜单节点{" "}
              <strong>{deletingMenu?.title}</strong> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMenuDeleteOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMenu}
              disabled={menuDeleting}
            >
              {menuDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
