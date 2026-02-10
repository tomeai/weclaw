"use client"

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
  AgentAdminItem,
  AgentAdminSearchParams,
  AgentCategory,
  deleteAgentAdmin,
  getAgentAdminServers,
  getAgentCategories,
} from "@/lib/agent"
import {
  Bot,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"

export default function AgentAdminPage() {
  const [agents, setAgents] = useState<AgentAdminItem[]>([])
  const [categories, setCategories] = useState<AgentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [categoryId, setCategoryId] = useState<number | "all">("all")

  // 获取 Agent 列表
  const fetchAgents = async (params: AgentAdminSearchParams = {}) => {
    try {
      setLoading(true)
      const response = await getAgentAdminServers({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword,
        category_id: categoryId === "all" ? undefined : categoryId,
        ...params,
      })

      setAgents(response.items)
      setTotal(response.total)
      setTotalPages(response.total_pages)
      setCurrentPage(response.page)
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("获取Agent列表失败")
    } finally {
      setLoading(false)
    }
  }

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const result = await getAgentCategories()
      setCategories(result)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [currentPage, pageSize])

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1)
    fetchAgents({ page: 1 })
  }

  // 重置搜索
  const handleReset = () => {
    setSearchKeyword("")
    setCategoryId("all")
    setCurrentPage(1)
    fetchAgents({
      page: 1,
      keyword: "",
      category_id: undefined,
    })
  }

  // 分页处理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // 刷新列表
  const handleRefresh = () => {
    fetchAgents()
  }

  // 删除 Agent
  const handleDelete = async (agentId: number) => {
    if (!confirm("确定要删除该 Agent 吗？")) return
    try {
      await deleteAgentAdmin(agentId)
      toast.success("删除成功")
      fetchAgents()
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast.error("删除失败")
    }
  }

  // 格式化时间
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
            <h1 className="text-3xl font-bold tracking-tight">Agent管理</h1>
            <p className="text-muted-foreground">
              管理所有 Agent，包括查看、编辑和删除操作
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

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>搜索和筛选</CardTitle>
            <CardDescription>
              根据关键词、分类筛选 Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      placeholder="搜索Agent名称或描述..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <Select
                  value={categoryId.toString()}
                  onValueChange={(value: string) =>
                    setCategoryId(value === "all" ? "all" : parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
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
            </div>
          </CardContent>
        </Card>

        {/* Agent 列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Agent列表</span>
              <span className="text-muted-foreground text-sm font-normal">
                共 {total} 个Agent
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : agents.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <Bot className="mx-auto mb-2 h-8 w-8 opacity-50" />
                暂无数据
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>创建者</TableHead>
                      <TableHead>工具</TableHead>
                      <TableHead>技能</TableHead>
                      <TableHead>知识库</TableHead>
                      <TableHead>数据库</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent, index) => (
                      <TableRow key={agent.id ?? index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {agent.avatar ? (
                              <img
                                src={agent.avatar}
                                alt={agent.title}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                <Bot className="h-4 w-4" />
                              </div>
                            )}
                            <span className="font-medium">{agent.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate"
                            title={agent.description || ""}
                          >
                            {agent.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {agent.owner}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Wrench className="h-3 w-3" />
                            {agent.tools}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Zap className="h-3 w-3" />
                            {agent.skills}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <BrainCircuit className="h-3 w-3" />
                            {agent.knowledge}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Database className="h-3 w-3" />
                            {agent.databases}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(agent.created_time)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toast.info("查看详情功能开发中")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => agent.id && handleDelete(agent.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                      显示第 {(currentPage - 1) * pageSize + 1} 到{" "}
                      {Math.min(currentPage * pageSize, total)} 条，共 {total}{" "}
                      条记录
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
