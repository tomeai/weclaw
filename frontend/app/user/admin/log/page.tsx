"use client"

import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import http from "@/lib/http"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** DELETE with JSON body (axios http.delete only supports query params) */
async function deleteWithBody(url: string, body: unknown) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  await fetch(`${base}${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageData<T> {
  page: number
  size: number
  total: number
  items: T[]
}

interface OperaLog {
  id: number
  trace_id: string
  username: string | null
  method: string
  title: string
  path: string
  ip: string
  country: string | null
  region: string | null
  city: string | null
  os: string | null
  browser: string | null
  device: string | null
  status: number // 1=success 0=fail
  code: string
  msg: string | null
  cost_time: number
  opera_time: string
  created_time: string
}

interface LoginLog {
  id: number
  username: string
  ip: string
  country: string | null
  region: string | null
  city: string | null
  os: string | null
  browser: string | null
  device: string | null
  status: number // 1=success 0=fail
  msg: string
  login_time: string
  created_time: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleString("zh-CN")
}

function StatusBadge({ status }: { status: number }) {
  return status === 1 ? (
    <Badge className="gap-1 bg-green-100 text-green-700">
      <CheckCircle2 className="h-3 w-3" />
      成功
    </Badge>
  ) : (
    <Badge className="gap-1 bg-red-100 text-red-700">
      <XCircle className="h-3 w-3" />
      失败
    </Badge>
  )
}

function MethodBadge({ method }: { method: string }) {
  const cls = METHOD_COLORS[method.toUpperCase()] ?? "bg-gray-100 text-gray-700"
  return <Badge className={cls}>{method.toUpperCase()}</Badge>
}

function LocationText({
  country,
  region,
  city,
}: {
  country: string | null
  region: string | null
  city: string | null
}) {
  const parts = [country, region, city].filter(Boolean)
  return <span className="text-muted-foreground text-xs">{parts.join(" · ") || "-"}</span>
}

// ─── Filter Bar ──────────────────────────────────────────────────────────────

interface FilterBarProps {
  username: string
  status: string
  ip: string
  loading: boolean
  onUsernameChange: (v: string) => void
  onStatusChange: (v: string) => void
  onIpChange: (v: string) => void
  onSearch: () => void
  onReset: () => void
}

function FilterBar({
  username, status, ip, loading,
  onUsernameChange, onStatusChange, onIpChange,
  onSearch, onReset,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[180px]">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="用户名"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          className="pl-9"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
      </div>
      <div className="relative min-w-[160px]">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="IP 地址"
          value={ip}
          onChange={(e) => onIpChange(e.target.value)}
          className="pl-9"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="1">成功</SelectItem>
          <SelectItem value="0">失败</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onSearch} disabled={loading}>
        <Search className="mr-2 h-4 w-4" />
        搜索
      </Button>
      <Button variant="outline" onClick={onReset} disabled={loading}>
        重置
      </Button>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-muted-foreground text-sm">
        第 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} 条，共 {total} 条
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          上一页
        </Button>
        <span className="text-sm">第 {page} / {totalPages} 页</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          下一页
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Opera Log Tab ────────────────────────────────────────────────────────────

function OperaLogTab() {
  const [data, setData] = useState<PageData<OperaLog>>({ page: 1, size: PAGE_SIZE, total: 0, items: [] })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [username, setUsername] = useState("")
  const [ip, setIp] = useState("")
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState<number[]>([])

  const fetch = useCallback(async (p = page) => {
    setLoading(true)
    setSelected([])
    try {
      const res = await http.get<PageData<OperaLog>>("/api/v1/admin/logs/opera", {
        page: p,
        size: PAGE_SIZE,
        username: username || undefined,
        ip: ip || undefined,
        status: status === "all" ? undefined : Number(status),
      })
      setData(res)
      setPage(p)
    } catch {
      // http interceptor handles toast
    } finally {
      setLoading(false)
    }
  }, [username, ip, status, page])

  useEffect(() => { fetch(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => fetch(1)
  const handleReset = () => {
    setUsername(""); setIp(""); setStatus("all")
    // reset then fetch
    setTimeout(() => fetch(1), 0)
  }

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return
    await deleteWithBody("/api/v1/admin/logs/opera", { pks: selected })
    fetch(1)
  }

  const handleClearAll = async () => {
    await deleteWithBody("/api/v1/admin/logs/opera/all", {})
    fetch(1)
  }

  const allChecked = data.items.length > 0 && data.items.every((r) => selected.includes(r.id))
  const toggleAll = () =>
    setSelected(allChecked ? [] : data.items.map((r) => r.id))
  const toggleOne = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          username={username} status={status} ip={ip} loading={loading}
          onUsernameChange={setUsername} onStatusChange={setStatus} onIpChange={setIp}
          onSearch={handleSearch} onReset={handleReset}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetch(page)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          {selected.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除所选 ({selected.length})
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleClearAll}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            清空全部
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 cursor-pointer rounded border" />
              </TableHead>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>操作标题</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>系统 / 浏览器</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">耗时</TableHead>
              <TableHead>操作时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-muted-foreground py-12 text-center">
                  暂无操作日志
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((log) => (
                <TableRow key={log.id} className={selected.includes(log.id) ? "bg-muted/30" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(log.id)}
                      onChange={() => toggleOne(log.id)}
                      className="h-4 w-4 cursor-pointer rounded border"
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{log.id}</TableCell>
                  <TableCell className="text-sm font-medium">{log.username ?? "-"}</TableCell>
                  <TableCell><MethodBadge method={log.method} /></TableCell>
                  <TableCell className="max-w-[140px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="truncate text-sm">{log.title}</TooltipTrigger>
                        <TooltipContent>{log.title}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-muted-foreground truncate font-mono text-xs">
                          {log.path}
                        </TooltipTrigger>
                        <TooltipContent>{log.path}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{log.os ?? "-"}</div>
                      <div className="text-muted-foreground">{log.browser ?? "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {log.cost_time.toFixed(0)} ms
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmt(log.opera_time)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={(p) => fetch(p)} />
    </div>
  )
}

// ─── Login Log Tab ────────────────────────────────────────────────────────────

function LoginLogTab() {
  const [data, setData] = useState<PageData<LoginLog>>({ page: 1, size: PAGE_SIZE, total: 0, items: [] })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [username, setUsername] = useState("")
  const [ip, setIp] = useState("")
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState<number[]>([])

  const fetch = useCallback(async (p = page) => {
    setLoading(true)
    setSelected([])
    try {
      const res = await http.get<PageData<LoginLog>>("/api/v1/admin/logs/login", {
        page: p,
        size: PAGE_SIZE,
        username: username || undefined,
        ip: ip || undefined,
        status: status === "all" ? undefined : Number(status),
      })
      setData(res)
      setPage(p)
    } catch {
      // http interceptor handles toast
    } finally {
      setLoading(false)
    }
  }, [username, ip, status, page])

  useEffect(() => { fetch(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => fetch(1)
  const handleReset = () => {
    setUsername(""); setIp(""); setStatus("all")
    setTimeout(() => fetch(1), 0)
  }

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return
    await deleteWithBody("/api/v1/admin/logs/login", { pks: selected })
    fetch(1)
  }

  const handleClearAll = async () => {
    await deleteWithBody("/api/v1/admin/logs/login/all", {})
    fetch(1)
  }

  const allChecked = data.items.length > 0 && data.items.every((r) => selected.includes(r.id))
  const toggleAll = () =>
    setSelected(allChecked ? [] : data.items.map((r) => r.id))
  const toggleOne = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          username={username} status={status} ip={ip} loading={loading}
          onUsernameChange={setUsername} onStatusChange={setStatus} onIpChange={setIp}
          onSearch={handleSearch} onReset={handleReset}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetch(page)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          {selected.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除所选 ({selected.length})
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleClearAll}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            清空全部
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 cursor-pointer rounded border" />
              </TableHead>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>归属地</TableHead>
              <TableHead>系统 / 浏览器</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>消息</TableHead>
              <TableHead>登录时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground py-12 text-center">
                  暂无登录日志
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((log) => (
                <TableRow key={log.id} className={selected.includes(log.id) ? "bg-muted/30" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(log.id)}
                      onChange={() => toggleOne(log.id)}
                      className="h-4 w-4 cursor-pointer rounded border"
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{log.id}</TableCell>
                  <TableCell className="text-sm font-medium">{log.username}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>
                    <LocationText country={log.country} region={log.region} city={log.city} />
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{log.os ?? "-"}</div>
                      <div className="text-muted-foreground">{log.browser ?? "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                  <TableCell className="text-muted-foreground max-w-[160px] truncate text-sm">
                    {log.msg}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmt(log.login_time)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={(p) => fetch(p)} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogsAdminPage() {
  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">操作日志</h1>
          <p className="text-muted-foreground">查看系统操作记录与登录历史</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>日志列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="opera">
              <TabsList className="mb-4">
                <TabsTrigger value="opera">操作日志</TabsTrigger>
                <TabsTrigger value="login">登录日志</TabsTrigger>
              </TabsList>
              <TabsContent value="opera">
                <OperaLogTab />
              </TabsContent>
              <TabsContent value="login">
                <LoginLogTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
