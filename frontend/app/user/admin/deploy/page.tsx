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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AdminDeployLogItem,
  AdminDeployLogSearchParams,
  getAdminDeployLogs,
} from "@/lib/mcp"
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react"
import { useEffect, useState } from "react"

// ── 状态配置 ──────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING:  { label: "等待中", variant: "secondary" },
  STARTED:  { label: "进行中", variant: "default" },
  SUCCESS:  { label: "成功",   variant: "default" },
  FAILURE:  { label: "失败",   variant: "destructive" },
  RETRY:    { label: "重试中", variant: "outline" },
  REVOKED:  { label: "已撤销", variant: "secondary" },
}

const STATUS_OPTIONS = [
  { value: "all",     label: "全部状态" },
  { value: "PENDING", label: "等待中" },
  { value: "STARTED", label: "进行中" },
  { value: "SUCCESS", label: "成功" },
  { value: "FAILURE", label: "失败" },
  { value: "RETRY",   label: "重试中" },
  { value: "REVOKED", label: "已撤销" },
]

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, variant: "secondary" as const }
  return (
    <Badge
      variant={cfg.variant}
      className={status === "SUCCESS" ? "bg-green-500/15 text-green-600 hover:bg-green-500/20 border-0" : undefined}
    >
      {cfg.label}
    </Badge>
  )
}

export default function AdminDeployLogPage() {
  const [logs, setLogs] = useState<AdminDeployLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  // 搜索条件
  const [username, setUsername] = useState("")
  const [serverTitle, setServerTitle] = useState("")
  const [taskStatus, setTaskStatus] = useState("all")

  const fetchLogs = async (params: AdminDeployLogSearchParams = {}) => {
    setLoading(true)
    try {
      const res = await getAdminDeployLogs({
        page: currentPage,
        size: pageSize,
        username: username || undefined,
        server_title: serverTitle || undefined,
        task_status: taskStatus === "all" ? undefined : taskStatus,
        ...params,
      })
      setLogs(res.items)
      setTotal(res.total)
      setTotalPages(res.total_pages)
      setCurrentPage(res.page)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLogs({ page: 1 })
  }

  const handleReset = () => {
    setUsername("")
    setServerTitle("")
    setTaskStatus("all")
    setCurrentPage(1)
    fetchLogs({ page: 1, username: undefined, server_title: undefined, task_status: undefined })
  }

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p)
  }

  const fmt = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleString("zh-CN") : "—"

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">部署日志</h1>
          <p className="text-muted-foreground">查询所有用户的 MCP 部署记录</p>
        </div>

        {/* 搜索栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[180px] flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <div className="relative min-w-[180px] flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="MCP 名称"
                  value={serverTitle}
                  onChange={(e) => setServerTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Select value={taskStatus} onValueChange={setTaskStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>重置</Button>
              <Button variant="outline" onClick={() => fetchLogs()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>部署日志</span>
              <span className="text-muted-foreground text-sm font-normal">共 {total} 条记录</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                加载中...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center">暂无数据</div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>MCP 名称</TableHead>
                      <TableHead>任务 ID</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>结果 / 错误</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>更新时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.id}</TableCell>
                        <TableCell>{log.username ?? "—"}</TableCell>
                        <TableCell>{log.server_title ?? "—"}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.task_id.slice(0, 8)}…
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={log.task_status} />
                        </TableCell>
                        <TableCell className="max-w-[240px]">
                          {log.task_status === "FAILURE" && log.traceback ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-pointer truncate text-xs text-destructive block max-w-[240px]">
                                    {log.traceback.split("\n").at(-2) ?? log.traceback}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[480px] whitespace-pre-wrap font-mono text-xs">
                                  {log.traceback}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : log.task_result ? (
                            <span className="truncate text-xs text-muted-foreground block max-w-[240px]">
                              {log.task_result}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{fmt(log.created_time)}</TableCell>
                        <TableCell className="text-sm">{fmt(log.updated_time)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      第 {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} 条，共 {total} 条
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                        <ChevronLeft className="h-4 w-4" />上一页
                      </Button>
                      <span className="text-sm">第 {currentPage} / {totalPages} 页</span>
                      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                        下一页<ChevronRight className="h-4 w-4" />
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
