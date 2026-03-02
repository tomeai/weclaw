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
  getSysMenuTree,
  getSysRoles,
  getSysUsers,
  updateRoleMenus,
  updateSysMenu,
  updateSysRole,
} from "@/lib/admin-sys"
import {
  Check,
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
  FolderOpen,
  KeyRound,
  Minus,
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

// ============ 工具函数 ============

function collectIds(nodes: SysMenuDetail[]): number[] {
  const ids: number[] = []
  for (const node of nodes) {
    ids.push(node.id)
    if (node.children?.length) ids.push(...collectIds(node.children))
  }
  return ids
}

function countAllNodes(nodes: SysMenuDetail[]): number {
  let count = 0
  for (const node of nodes) {
    count++
    if (node.children?.length) count += countAllNodes(node.children)
  }
  return count
}

function flattenTree(nodes: SysMenuDetail[]): SysMenuDetail[] {
  const result: SysMenuDetail[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) result.push(...flattenTree(node.children))
  }
  return result
}

function getNodeCheckState(
  node: SysMenuDetail,
  selected: Set<number>
): "checked" | "indeterminate" | "unchecked" {
  const allIds = collectIds([node])
  const cnt = allIds.filter((id) => selected.has(id)).length
  if (cnt === 0) return "unchecked"
  if (cnt === allIds.length) return "checked"
  return "indeterminate"
}

function toggleNodeIds(node: SysMenuDetail, selected: Set<number>): Set<number> {
  const next = new Set(selected)
  const allIds = collectIds([node])
  const allChecked = allIds.every((id) => next.has(id))
  if (allChecked) {
    allIds.forEach((id) => next.delete(id))
  } else {
    allIds.forEach((id) => next.add(id))
  }
  return next
}

const formatDate = (d: string | null | undefined) => {
  if (!d) return "-"
  return new Date(d).toLocaleString("zh-CN")
}

function typeIcon(type: number) {
  return type === 0 ? FolderOpen : type === 1 ? FileText : KeyRound
}
function typeColor(type: number) {
  return type === 0 ? "text-blue-500" : type === 1 ? "text-green-600" : "text-purple-500"
}
function typeLabel(type: number) {
  return type === 0 ? "目录" : type === 1 ? "菜单" : "按钮"
}
function typeBadgeClass(type: number) {
  return type === 0
    ? "bg-blue-50 text-blue-600 border-blue-100"
    : type === 1
      ? "bg-green-50 text-green-600 border-green-100"
      : "bg-purple-50 text-purple-600 border-purple-100"
}

// ============ 权限树节点（角色分配用，带 checkbox）============

interface PermTreeNodeProps {
  node: SysMenuDetail
  depth: number
  selectedIds: Set<number>
  onToggle: (node: SysMenuDetail) => void
  readOnly?: boolean
}

function PermTreeNode({ node, depth, selectedIds, onToggle, readOnly }: PermTreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const checkState = getNodeCheckState(node, selectedIds)
  const hasChildren = !!(node.children?.length)
  const Icon = typeIcon(node.type)

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 select-none ${readOnly ? "" : "cursor-pointer hover:bg-muted/50"}`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
        onClick={() => !readOnly && onToggle(node)}
      >
        {/* 展开/收起 */}
        <span
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center"
          onClick={(e) => {
            if (!hasChildren) return
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : (
            <span className="h-3 w-3" />
          )}
        </span>

        {/* Checkbox */}
        {!readOnly && (
          <div
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
              checkState === "checked"
                ? "border-primary bg-primary text-primary-foreground"
                : checkState === "indeterminate"
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/40 bg-background"
            }`}
          >
            {checkState === "checked" && <Check className="h-3 w-3" />}
            {checkState === "indeterminate" && <Minus className="h-3 w-3 text-primary" />}
          </div>
        )}

        <Icon className={`h-4 w-4 flex-shrink-0 ${typeColor(node.type)}`} />
        <span className="flex-1 text-sm">{node.title}</span>

        {node.type === 2 && node.perms && (
          <span className="font-mono text-xs text-muted-foreground">{node.perms}</span>
        )}

        <Badge variant="outline" className={`px-1.5 py-0 text-xs ${typeBadgeClass(node.type)}`}>
          {typeLabel(node.type)}
        </Badge>

        {readOnly && node.status === 0 && (
          <Badge className="px-1.5 py-0 text-xs bg-gray-100 text-gray-500">禁用</Badge>
        )}
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <PermTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============ 菜单节点树（节点管理用）============

interface MenuTreeNodeProps {
  node: SysMenuDetail
  depth: number
  onEdit: (menu: SysMenuDetail) => void
  onDelete: (menu: SysMenuDetail) => void
  onAddChild: (type: MenuType, parentId: number) => void
}

function MenuTreeNode({ node, depth, onEdit, onDelete, onAddChild }: MenuTreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = !!(node.children?.length)
  const Icon = typeIcon(node.type)

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 transition-colors hover:bg-muted/30"
        style={{ marginLeft: `${depth * 28}px` }}
      >
        {/* 展开/收起 */}
        <button
          type="button"
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center"
          onClick={() => hasChildren && setExpanded((v) => !v)}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : (
            <span className="h-3 w-3" />
          )}
        </button>

        <Icon className={`h-4 w-4 flex-shrink-0 ${typeColor(node.type)}`} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium">{node.title}</span>
            <Badge className={`px-1.5 py-0 text-xs ${typeBadgeClass(node.type)}`}>
              {typeLabel(node.type)}
            </Badge>
            {node.status === 1 ? (
              <Badge className="px-1.5 py-0 text-xs bg-green-100 text-green-700">启用</Badge>
            ) : (
              <Badge className="px-1.5 py-0 text-xs bg-gray-100 text-gray-700">禁用</Badge>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>标识: {node.name}</span>
            {node.path && <span>路径: {node.path}</span>}
            {node.perms && <span>权限: {node.perms}</span>}
            <span>排序: {node.sort}</span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {node.type === 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-green-600 hover:text-green-700"
                onClick={() => onAddChild(1, node.id)}
                title="新增菜单"
              >
                <Plus className="h-3 w-3" />菜单
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-purple-600 hover:text-purple-700"
                onClick={() => onAddChild(2, node.id)}
                title="新增按钮"
              >
                <Plus className="h-3 w-3" />按钮
              </Button>
            </>
          )}
          {node.type === 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-purple-600 hover:text-purple-700"
              onClick={() => onAddChild(2, node.id)}
              title="新增按钮"
            >
              <Plus className="h-3 w-3" />按钮
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(node)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(node)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <MenuTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
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

  // ---- 搜索 ----
  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("all")

  // ---- 菜单树（全局共享）----
  const [menuTree, setMenuTree] = useState<SysMenuDetail[]>([])
  const [treeLoading, setTreeLoading] = useState(false)

  // ---- 角色弹窗 ----
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

  // ---- 菜单节点弹窗 ----
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

  const totalNodes = countAllNodes(menuTree)
  // 可作为菜单父级的节点（目录）
  const directoryNodes = flattenTree(menuTree).filter((m) => m.type === 0)
  // 可作为按钮父级的节点（目录 + 菜单）
  const parentNodes = flattenTree(menuTree).filter((m) => m.type === 0 || m.type === 1)

  // ============ 数据获取 ============

  const fetchMenuTree = useCallback(async () => {
    setTreeLoading(true)
    try {
      const tree = await getSysMenuTree()
      setMenuTree(tree)
    } catch {
      // handled by interceptor
    } finally {
      setTreeLoading(false)
    }
  }, [])

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

  useEffect(() => { fetchRoles() }, [fetchRoles])
  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchMenuTree() }, [fetchMenuTree])

  // ============ 事件处理 ============

  const handleRefresh = () => {
    fetchRoles()
    fetchStats()
    fetchMenuTree()
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

  const handleAdd = () => {
    setEditingRole(null)
    setFormData({ name: "", status: 1, remark: "" })
    setSelectedMenuIds(new Set())
    setDialogOpen(true)
  }

  const handleEdit = async (role: SysRoleDetail) => {
    setEditingRole(role)
    setFormData({ name: role.name, status: role.status, remark: role.remark ?? "" })
    setSelectedMenuIds(new Set())
    setMenuLoading(true)
    setDialogOpen(true)
    try {
      const roleMenus = await getRoleMenuTree(role.id)
      setSelectedMenuIds(new Set(collectIds(roleMenus ?? [])))
    } catch {
      // handled by interceptor
    } finally {
      setMenuLoading(false)
    }
  }

  const handleTogglePerm = (node: SysMenuDetail) => {
    setSelectedMenuIds((prev) => toggleNodeIds(node, prev))
  }

  const handleSelectAll = () => {
    setSelectedMenuIds(new Set(collectIds(menuTree)))
  }

  const handleClearAll = () => {
    setSelectedMenuIds(new Set())
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
        remark: formData.remark || null,
      }
      if (editingRole) {
        await updateSysRole(editingRole.id, payload)
        await updateRoleMenus(editingRole.id, Array.from(selectedMenuIds))
        toast.success("角色更新成功")
      } else {
        await createSysRole(payload)
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
      fetchMenuTree()
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
      fetchMenuTree()
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
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
                  <p className="text-2xl font-bold">{totalNodes}</p>
                  <p className="text-muted-foreground text-sm">菜单节点</p>
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
            <TabsTrigger value="menus" className="gap-1.5">
              <FolderOpen className="h-4 w-4" />
              菜单节点
            </TabsTrigger>
          </TabsList>

          {/* ========== 角色管理 Tab ========== */}
          <TabsContent value="roles" className="mt-4 space-y-4">
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
                    onValueChange={(value: "all" | "0" | "1") => setStatusFilter(value)}
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
                                {role.remark || "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {role.status === 1 ? (
                                <Badge className="bg-green-100 text-green-700">启用</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-700">禁用</Badge>
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
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

          {/* ========== 菜单节点 Tab ========== */}
          <TabsContent value="menus" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">菜单节点管理</h2>
                <p className="text-muted-foreground text-sm">
                  管理目录、菜单和按钮权限节点
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchMenuTree} disabled={treeLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${treeLoading ? "animate-spin" : ""}`} />
                  刷新
                </Button>
                <Button onClick={() => handleAddMenu(0)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增目录
                </Button>
              </div>
            </div>

            {treeLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : menuTree.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                <FolderOpen className="mx-auto mb-4 h-12 w-12" />
                <p>暂无菜单节点，点击「新增目录」开始创建</p>
              </div>
            ) : (
              <div className="space-y-1">
                {menuTree.map((node) => (
                  <MenuTreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    onEdit={handleEditMenu}
                    onDelete={handleDeleteMenuConfirm}
                    onAddChild={handleAddMenu}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ========== 新增/编辑角色弹窗 ========== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? "编辑角色" : "新增角色"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "修改角色信息和权限分配" : "创建新角色并分配权限"}
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
                    禁用后该角色下的用户将失去对应权限
                  </p>
                </div>
                <Switch
                  checked={formData.status === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, status: checked ? 1 : 0 }))
                  }
                />
              </div>
            </div>

            {/* 权限分配 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>权限分配</Label>
                {menuTree.length > 0 && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleSelectAll}
                    >
                      全选
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleClearAll}
                    >
                      清空
                    </Button>
                  </div>
                )}
              </div>

              {menuLoading ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  加载权限列表...
                </div>
              ) : menuTree.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无可分配的权限节点</p>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    已选择 {selectedMenuIds.size} / {totalNodes} 个节点
                  </p>
                  <div className="max-h-[400px] overflow-y-auto rounded-lg border p-2">
                    <div className="space-y-0.5">
                      {menuTree.map((node) => (
                        <PermTreeNode
                          key={node.id}
                          node={node}
                          depth={0}
                          selectedIds={selectedMenuIds}
                          onToggle={handleTogglePerm}
                        />
                      ))}
                    </div>
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
              {saving ? "保存中..." : editingRole ? "保存修改" : "创建角色"}
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
              确定要删除角色 <strong>{deletingRole?.name}</strong> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 菜单节点新增/编辑弹窗 ========== */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? "编辑菜单节点" : "新增菜单节点"}
            </DialogTitle>
            <DialogDescription>
              {menuFormData.type === 0
                ? "目录节点，可包含菜单和按钮"
                : menuFormData.type === 1
                  ? "菜单节点，对应页面路由，可包含按钮"
                  : "按钮节点，用于接口访问控制"}
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
                    <SelectItem value="0">目录（顶级容器）</SelectItem>
                    <SelectItem value="1">菜单（页面路由）</SelectItem>
                    <SelectItem value="2">按钮（权限控制）</SelectItem>
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
                  setMenuFormData((prev) => ({ ...prev, title: e.target.value }))
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
                  setMenuFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="唯一标识符（英文）"
              />
            </div>

            {/* 路由路径（目录和菜单） */}
            {(menuFormData.type === 0 || menuFormData.type === 1) && (
              <div className="space-y-2">
                <Label>路由路径</Label>
                <Input
                  value={menuFormData.path}
                  onChange={(e) =>
                    setMenuFormData((prev) => ({ ...prev, path: e.target.value }))
                  }
                  placeholder="/user/admin/xxx"
                />
              </div>
            )}

            {/* 图标（目录和菜单） */}
            {(menuFormData.type === 0 || menuFormData.type === 1) && (
              <div className="space-y-2">
                <Label>图标名称</Label>
                <Input
                  value={menuFormData.icon}
                  onChange={(e) =>
                    setMenuFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="如: Shield, Settings, Users..."
                />
              </div>
            )}

            {/* 权限标识（菜单和按钮） */}
            {(menuFormData.type === 1 || menuFormData.type === 2) && (
              <div className="space-y-2">
                <Label>权限标识</Label>
                <Input
                  value={menuFormData.perms}
                  onChange={(e) =>
                    setMenuFormData((prev) => ({ ...prev, perms: e.target.value }))
                  }
                  placeholder="如: sys:user:list"
                />
              </div>
            )}

            {/* 所属目录（type=1 菜单，父级只能是目录） */}
            {menuFormData.type === 1 && (
              <div className="space-y-2">
                <Label>所属目录</Label>
                <Select
                  value={menuFormData.parent_id ? String(menuFormData.parent_id) : "none"}
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
                    {directoryNodes.map((dir) => (
                      <SelectItem key={dir.id} value={String(dir.id)}>
                        {dir.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 所属父级（type=2 按钮，父级可以是目录或菜单） */}
            {menuFormData.type === 2 && (
              <div className="space-y-2">
                <Label>所属父级</Label>
                <Select
                  value={menuFormData.parent_id ? String(menuFormData.parent_id) : "none"}
                  onValueChange={(v) =>
                    setMenuFormData((prev) => ({
                      ...prev,
                      parent_id: v === "none" ? null : Number(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择所属目录或菜单" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（顶级）</SelectItem>
                    {parentNodes.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.type === 0 ? "📁 " : "📄 "}
                        {p.title}
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
            <Button variant="outline" onClick={() => setMenuDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMenu} disabled={menuSaving}>
              {menuSaving ? "保存中..." : editingMenu ? "保存修改" : "创建菜单"}
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
            <Button variant="outline" onClick={() => setMenuDeleteOpen(false)}>
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
