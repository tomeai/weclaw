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
  FolderTree,
  Key,
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

// ============ 常量 ============

const MENU_TYPE_LABELS: Record<MenuType, string> = {
  0: "目录",
  1: "菜单",
  2: "按钮",
  3: "内嵌",
  4: "外链",
}

const MENU_TYPE_COLORS: Record<MenuType, string> = {
  0: "bg-purple-100 text-purple-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-cyan-100 text-cyan-700",
  4: "bg-green-100 text-green-700",
}

// ============ 角色管理 Tab ============

function RolesTab() {
  const [roles, setRoles] = useState<SysRoleDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const [statsTotal, setStatsTotal] = useState(0)
  const [statsActive, setStatsActive] = useState(0)
  const [statsUsers, setStatsUsers] = useState(0)

  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<SysRoleDetail | null>(null)
  const [formData, setFormData] = useState<CreateSysRoleParam>({
    name: "",
    status: 1,
    is_filter_scopes: true,
    remark: "",
  })
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<SysRoleDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 分配菜单弹窗
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [menuRole, setMenuRole] = useState<SysRoleDetail | null>(null)
  const [allMenus, setAllMenus] = useState<SysMenuDetail[]>([])
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<number>>(new Set())
  const [menuSaving, setMenuSaving] = useState(false)
  const [menuLoading, setMenuLoading] = useState(false)

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
      const [allData, activeData, usersData] = await Promise.all([
        getSysRoles({ page: 1, size: 1 }),
        getSysRoles({ page: 1, size: 1, status: 1 }),
        getSysUsers({ page: 1, size: 1 }),
      ])
      setStatsTotal(allData.total)
      setStatsActive(activeData.total)
      setStatsUsers(usersData.total)
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

  const handleSearch = () => {
    setCurrentPage(1)
    fetchRoles()
  }

  const handleReset = () => {
    setSearchName("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setEditingRole(null)
    setFormData({ name: "", status: 1, is_filter_scopes: true, remark: "" })
    setDialogOpen(true)
  }

  const handleEdit = (role: SysRoleDetail) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      status: role.status,
      is_filter_scopes: role.is_filter_scopes,
      remark: role.remark ?? "",
    })
    setDialogOpen(true)
  }

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
        is_filter_scopes: formData.is_filter_scopes ?? true,
        remark: formData.remark || null,
      }
      if (editingRole) {
        await updateSysRole(editingRole.id, payload)
        toast.success("角色更新成功")
      } else {
        await createSysRole(payload)
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

  // 打开菜单分配弹窗
  const handleOpenMenuDialog = async (role: SysRoleDetail) => {
    setMenuRole(role)
    setMenuDialogOpen(true)
    setMenuLoading(true)
    try {
      const [menus, roleMenus] = await Promise.all([
        getSysMenus(),
        getRoleMenuTree(role.id),
      ])
      setAllMenus(menus)
      // 收集角色已有的菜单 ID（树形结构需要递归提取）
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

  const handleMenuToggle = (menuId: number) => {
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

  const handleSaveMenus = async () => {
    if (!menuRole) return
    setMenuSaving(true)
    try {
      await updateRoleMenus(menuRole.id, Array.from(selectedMenuIds))
      toast.success("菜单权限已更新")
      setMenuDialogOpen(false)
    } catch {
      // handled by interceptor
    } finally {
      setMenuSaving(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{statsUsers}</p>
                <p className="text-muted-foreground text-sm">平台总用户</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>角色列表</span>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增角色
            </Button>
          </CardTitle>
          <CardDescription>管理系统角色，控制用户访问权限</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    <TableHead>数据过滤</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.id}</TableCell>
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
                          {role.remark ?? "-"}
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
                        {role.is_filter_scopes ? (
                          <Badge variant="outline" className="text-xs">
                            开启
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            关闭
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(role.created_time)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenMenuDialog(role)}
                            title="配置菜单权限"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
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
                    第 {currentPage} 页，共 {totalPages} 页，共 {total} 条
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
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
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑角色弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? "编辑角色" : "新增角色"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "修改角色基本信息" : "创建新角色"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                  setFormData((prev) => ({ ...prev, remark: e.target.value }))
                }
                placeholder="请输入角色描述"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>启用状态</Label>
                <p className="text-muted-foreground text-sm">
                  禁用后该角色将不可使用
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>数据权限过滤</Label>
                <p className="text-muted-foreground text-sm">
                  开启后按数据范围过滤查询结果
                </p>
              </div>
              <Switch
                checked={formData.is_filter_scopes ?? true}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_filter_scopes: checked,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : editingRole ? "保存修改" : "创建角色"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
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

      {/* 分配菜单弹窗 */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>配置菜单权限 — {menuRole?.name}</DialogTitle>
            <DialogDescription>
              勾选该角色可访问的菜单和操作权限
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {menuLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                加载中...
              </div>
            ) : allMenus.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm">
                暂无菜单数据
              </p>
            ) : (
              <div className="space-y-1">
                {/* 按父级分组显示 */}
                {allMenus
                  .filter((m) => !m.parent_id)
                  .map((parent) => (
                    <div key={parent.id} className="space-y-1">
                      <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50">
                        <input
                          type="checkbox"
                          id={`menu-${parent.id}`}
                          checked={selectedMenuIds.has(parent.id)}
                          onChange={() => handleMenuToggle(parent.id)}
                          className="h-4 w-4 cursor-pointer accent-primary"
                        />
                        <label
                          htmlFor={`menu-${parent.id}`}
                          className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium"
                        >
                          <Badge
                            className={`text-xs ${MENU_TYPE_COLORS[parent.type]}`}
                          >
                            {MENU_TYPE_LABELS[parent.type]}
                          </Badge>
                          {parent.title}
                        </label>
                      </div>
                      {/* 子菜单 */}
                      {allMenus
                        .filter((m) => m.parent_id === parent.id)
                        .map((child) => (
                          <div key={child.id} className="space-y-0.5">
                            <div className="flex items-center gap-2 rounded px-2 py-1 pl-6 hover:bg-muted/50">
                              <input
                                type="checkbox"
                                id={`menu-${child.id}`}
                                checked={selectedMenuIds.has(child.id)}
                                onChange={() => handleMenuToggle(child.id)}
                                className="h-4 w-4 cursor-pointer accent-primary"
                              />
                              <label
                                htmlFor={`menu-${child.id}`}
                                className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
                              >
                                <Badge
                                  className={`text-xs ${MENU_TYPE_COLORS[child.type]}`}
                                >
                                  {MENU_TYPE_LABELS[child.type]}
                                </Badge>
                                {child.title}
                                {child.perms && (
                                  <span className="text-muted-foreground font-mono text-xs">
                                    ({child.perms})
                                  </span>
                                )}
                              </label>
                            </div>
                            {/* 三级菜单（按钮/权限） */}
                            {allMenus
                              .filter((m) => m.parent_id === child.id)
                              .map((btn) => (
                                <div
                                  key={btn.id}
                                  className="flex items-center gap-2 rounded px-2 py-1 pl-12 hover:bg-muted/50"
                                >
                                  <input
                                    type="checkbox"
                                    id={`menu-${btn.id}`}
                                    checked={selectedMenuIds.has(btn.id)}
                                    onChange={() => handleMenuToggle(btn.id)}
                                    className="h-4 w-4 cursor-pointer accent-primary"
                                  />
                                  <label
                                    htmlFor={`menu-${btn.id}`}
                                    className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
                                  >
                                    <Badge
                                      className={`text-xs ${MENU_TYPE_COLORS[btn.type]}`}
                                    >
                                      {MENU_TYPE_LABELS[btn.type]}
                                    </Badge>
                                    {btn.title}
                                    {btn.perms && (
                                      <span className="text-muted-foreground font-mono text-xs">
                                        ({btn.perms})
                                      </span>
                                    )}
                                  </label>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex w-full items-center justify-between">
              <span className="text-muted-foreground text-sm">
                已选 {selectedMenuIds.size} 项
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMenuDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleSaveMenus} disabled={menuSaving}>
                  {menuSaving ? "保存中..." : "保存权限"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ 菜单权限 Tab ============

const DEFAULT_MENU_FORM: CreateSysMenuParam = {
  title: "",
  name: "",
  path: null,
  parent_id: null,
  sort: 0,
  icon: null,
  type: 1,
  component: null,
  perms: null,
  status: 1,
  display: 1,
  cache: 1,
  link: null,
  remark: null,
}

function MenusTab() {
  const [menus, setMenus] = useState<SysMenuDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<"all" | string>("all")
  const [searchTitle, setSearchTitle] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<SysMenuDetail | null>(null)
  const [formData, setFormData] = useState<CreateSysMenuParam>(DEFAULT_MENU_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingMenu, setDeletingMenu] = useState<SysMenuDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMenus = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSysMenus()
      setMenus(data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const filteredMenus = menus.filter((m) => {
    const matchType = typeFilter === "all" || String(m.type) === typeFilter
    const matchTitle =
      !searchTitle ||
      m.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
      (m.perms ?? "").toLowerCase().includes(searchTitle.toLowerCase())
    return matchType && matchTitle
  })

  const handleAdd = () => {
    setEditingMenu(null)
    setFormData(DEFAULT_MENU_FORM)
    setDialogOpen(true)
  }

  const handleEdit = (menu: SysMenuDetail) => {
    setEditingMenu(menu)
    setFormData({
      title: menu.title,
      name: menu.name,
      path: menu.path,
      parent_id: menu.parent_id,
      sort: menu.sort,
      icon: menu.icon,
      type: menu.type,
      component: menu.component,
      perms: menu.perms,
      status: menu.status,
      display: menu.display,
      cache: menu.cache,
      link: menu.link,
      remark: menu.remark,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("请输入菜单标题")
      return
    }
    if (!formData.name.trim()) {
      toast.error("请输入菜单名称")
      return
    }
    setSaving(true)
    try {
      const payload: CreateSysMenuParam = {
        ...formData,
        title: formData.title.trim(),
        name: formData.name.trim(),
        path: formData.path || null,
        icon: formData.icon || null,
        component: formData.component || null,
        perms: formData.perms || null,
        link: formData.link || null,
        remark: formData.remark || null,
        parent_id: formData.parent_id || null,
      }
      if (editingMenu) {
        await updateSysMenu(editingMenu.id, payload)
        toast.success("菜单更新成功")
      } else {
        await createSysMenu(payload)
        toast.success("菜单创建成功")
      }
      setDialogOpen(false)
      fetchMenus()
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = (menu: SysMenuDetail) => {
    setDeletingMenu(menu)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingMenu) return
    setDeleting(true)
    try {
      await deleteSysMenu(deletingMenu.id)
      toast.success("菜单已删除")
      setDeleteOpen(false)
      fetchMenus()
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false)
    }
  }

  const getParentTitle = (parentId: number | null) => {
    if (!parentId) return "-"
    const parent = menus.find((m) => m.id === parentId)
    return parent ? parent.title : String(parentId)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>菜单 & 权限列表</span>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增菜单
            </Button>
          </CardTitle>
          <CardDescription>
            管理菜单结构和操作权限标识（perms），权限标识用于 RBAC 鉴权
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索 */}
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="搜索标题或权限标识..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="菜单类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="0">目录</SelectItem>
                <SelectItem value="1">菜单</SelectItem>
                <SelectItem value="2">按钮/权限</SelectItem>
                <SelectItem value="3">内嵌</SelectItem>
                <SelectItem value="4">外链</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTitle("")
                setTypeFilter("all")
              }}
            >
              重置
            </Button>
            <Button variant="outline" onClick={fetchMenus} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          </div>

          {/* 类型统计 */}
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2, 3, 4] as MenuType[]).map((type) => {
              const count = menus.filter((m) => m.type === type).length
              return (
                <Badge
                  key={type}
                  className={`cursor-pointer text-xs ${MENU_TYPE_COLORS[type]}`}
                  onClick={() =>
                    setTypeFilter(
                      typeFilter === String(type) ? "all" : String(type)
                    )
                  }
                >
                  {MENU_TYPE_LABELS[type]}: {count}
                </Badge>
              )
            })}
          </div>

          {/* 菜单表格 */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
              加载中...
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <FolderTree className="mx-auto mb-4 h-12 w-12" />
              <p>暂无匹配的菜单</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>权限标识</TableHead>
                  <TableHead>父级</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell className="font-medium text-sm">{menu.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{menu.title}</p>
                        <p className="text-muted-foreground font-mono text-xs">{menu.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${MENU_TYPE_COLORS[menu.type]}`}>
                        {MENU_TYPE_LABELS[menu.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {menu.perms ? (
                        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                          {menu.perms}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getParentTitle(menu.parent_id)}
                    </TableCell>
                    <TableCell className="text-sm">{menu.sort}</TableCell>
                    <TableCell>
                      {menu.status === 1 ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          启用
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 text-xs">
                          禁用
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(menu)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteConfirm(menu)}
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

      {/* 新增/编辑菜单弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMenu ? "编辑菜单" : "新增菜单"}</DialogTitle>
            <DialogDescription>
              {editingMenu ? "修改菜单配置" : "创建菜单或权限节点"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>菜单标题 *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="如：用户管理"
                />
              </div>
              <div className="space-y-2">
                <Label>菜单名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="如：UserManage（唯一标识）"
                />
              </div>
              <div className="space-y-2">
                <Label>菜单类型 *</Label>
                <Select
                  value={String(formData.type)}
                  onValueChange={(v) =>
                    setFormData((p) => ({
                      ...p,
                      type: Number(v) as MenuType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">目录</SelectItem>
                    <SelectItem value="1">菜单</SelectItem>
                    <SelectItem value="2">按钮/权限</SelectItem>
                    <SelectItem value="3">内嵌</SelectItem>
                    <SelectItem value="4">外链</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>父级菜单</Label>
                <Select
                  value={
                    formData.parent_id !== null
                      ? String(formData.parent_id)
                      : "none"
                  }
                  onValueChange={(v) =>
                    setFormData((p) => ({
                      ...p,
                      parent_id: v === "none" ? null : Number(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="无（顶级）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（顶级）</SelectItem>
                    {menus
                      .filter(
                        (m) =>
                          m.type !== 2 &&
                          (!editingMenu || m.id !== editingMenu.id)
                      )
                      .map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>权限标识</Label>
                <Input
                  value={formData.perms ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      perms: e.target.value || null,
                    }))
                  }
                  placeholder="如：sys:user:list"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sort: Number(e.target.value),
                    }))
                  }
                  min={0}
                />
              </div>
              {formData.type !== 2 && (
                <div className="col-span-2 space-y-2">
                  <Label>路由地址</Label>
                  <Input
                    value={formData.path ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        path: e.target.value || null,
                      }))
                    }
                    placeholder="如：/user/manage"
                  />
                </div>
              )}
              {formData.type === 1 && (
                <div className="col-span-2 space-y-2">
                  <Label>组件路径</Label>
                  <Input
                    value={formData.component ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        component: e.target.value || null,
                      }))
                    }
                    placeholder="如：views/user/index"
                  />
                </div>
              )}
              {formData.type === 4 && (
                <div className="col-span-2 space-y-2">
                  <Label>外链地址</Label>
                  <Input
                    value={formData.link ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        link: e.target.value || null,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>图标</Label>
                <Input
                  value={formData.icon ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      icon: e.target.value || null,
                    }))
                  }
                  placeholder="图标名称"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>备注</Label>
                <Input
                  value={formData.remark ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      remark: e.target.value || null,
                    }))
                  }
                  placeholder="备注说明"
                />
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="text-sm font-medium">启用状态</p>
                  <p className="text-muted-foreground text-xs">禁用后不可用</p>
                </div>
                <Switch
                  checked={formData.status === 1}
                  onCheckedChange={(c) =>
                    setFormData((p) => ({ ...p, status: c ? 1 : 0 }))
                  }
                />
              </div>
              {formData.type !== 2 && (
                <>
                  <div className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium">显示</p>
                      <p className="text-muted-foreground text-xs">
                        是否在菜单中显示
                      </p>
                    </div>
                    <Switch
                      checked={formData.display === 1}
                      onCheckedChange={(c) =>
                        setFormData((p) => ({ ...p, display: c ? 1 : 0 }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium">缓存</p>
                      <p className="text-muted-foreground text-xs">
                        是否缓存页面
                      </p>
                    </div>
                    <Switch
                      checked={formData.cache === 1}
                      onCheckedChange={(c) =>
                        setFormData((p) => ({ ...p, cache: c ? 1 : 0 }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : editingMenu ? "保存修改" : "创建菜单"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除菜单 <strong>{deletingMenu?.title}</strong>{" "}
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
    </div>
  )
}

// ============ 主页面 ============

export default function PermissionsAdminPage() {
  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">权限管理</h1>
          <p className="text-muted-foreground">
            管理系统角色与菜单权限，控制用户访问
          </p>
        </div>

        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              角色管理
            </TabsTrigger>
            <TabsTrigger value="menus" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              菜单权限
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-4">
            <RolesTab />
          </TabsContent>

          <TabsContent value="menus" className="mt-4">
            <MenusTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
