"use client"

import { AdminSidebar } from "@/app/components/admin/admin-sidebar"
import AdminLayout from "@/app/components/layout/admin-layout"
import {
  getMcpAdminServers,
  McpAdminServerItem,
  McpAdminServersParams,
} from "@/app/lib/api"
import { McpDetailModal } from "@/components/mcp/mcp-detail-modal"
import { McpEditModal } from "@/components/mcp/mcp-edit-modal"
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
  Edit,
  ExternalLink,
  Eye,
  GitBranch,
  Package,
  RefreshCw,
  Search,
  Terminal,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function McpAdminPage() {
  const [servers, setServers] = useState<McpAdminServerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [serverType, setServerType] = useState<"hosted" | "local" | "all">(
    "all"
  )
  const [compileType, setCompileType] = useState<"package" | "stdio" | "all">(
    "all"
  )
  const [isPublic, setIsPublic] = useState<number | "all">(0)
  const [transport, setTransport] = useState<
    "stdio" | "sse" | "streamable" | "all"
  >("all")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEditServerId, setSelectedEditServerId] = useState<number | null>(null)

  // 获取 MCP 服务器列表
  const fetchServers = async (params: McpAdminServersParams = {}) => {
    try {
      setLoading(true)
      const response = await getMcpAdminServers({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword,
        server_type: serverType === "all" ? undefined : serverType,
        compile_type: compileType === "all" ? undefined : compileType,
        is_public: isPublic === "all" ? undefined : isPublic,
        transport: transport === "all" ? undefined : transport,
        ...params,
      })

      if (response.code === 200) {
        setServers(response.data.items)
        setTotal(response.data.total)
        setTotalPages(response.data.total_pages)
        setCurrentPage(response.data.page)
      } else {
        toast.error(`获取服务器列表失败: ${response.msg}`)
      }
    } catch (error) {
      console.error("Error fetching MCP servers:", error)
      toast.error("获取服务器列表失败")
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchServers()
  }, [currentPage, pageSize])

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1)
    fetchServers()
  }

  // 重置搜索
  const handleReset = () => {
    setSearchKeyword("")
    setServerType("all")
    setCompileType("all")
    setIsPublic(0)
    setTransport("all")
    setCurrentPage(1)
    fetchServers({
      page: 1,
      keyword: "",
      server_type: undefined,
      compile_type: undefined,
      is_public: 0,
      transport: undefined,
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
    fetchServers()
  }

  // 格式化时间
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 获取服务器类型徽章
  const getServerTypeBadge = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      hosted: "default",
      local: "secondary",
    }
    return (
      <Badge variant={variants[type] || "outline"}>
        {type === "hosted" ? "托管" : "本地"}
      </Badge>
    )
  }

  // 获取编译类型徽章
  const getCompileTypeBadge = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      package: "default",
      stdio: "secondary",
    }
    return (
      <Badge variant={variants[type] || "outline"}>
        {type === "package" ? "包" : "STDIO"}
      </Badge>
    )
  }

  // 处理查看详情
  const handleViewDetail = (serverId: number) => {
    console.log('查看详情被点击，服务器ID:', serverId)
    setSelectedServerId(serverId)
    setDetailModalOpen(true)
  }

  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedServerId(null)
  }

  // 处理编辑服务器
  const handleEditServer = (serverId: number) => {
    setSelectedEditServerId(serverId)
    setEditModalOpen(true)
  }

  // 关闭编辑模态框
  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedEditServerId(null)
  }

  // 编辑成功回调
  const handleEditSuccess = () => {
    fetchServers() // 重新加载服务器列表
  }

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MCP管理</h1>
            <p className="text-muted-foreground">
              管理所有 MCP 服务器，包括查看、编辑和删除操作
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
              根据关键词、部署类型、协议类型或公开状态筛选 MCP 服务器
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      placeholder="搜索服务器名称或描述..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <Select
                  value={serverType}
                  onValueChange={(value: "hosted" | "local" | "all") =>
                    setServerType(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="部署类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">部署类型</SelectItem>
                    <SelectItem value="hosted">托管</SelectItem>
                    <SelectItem value="local">本地</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={transport}
                  onValueChange={(
                    value: "stdio" | "sse" | "streamable" | "all"
                  ) => setTransport(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="协议类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">协议类型</SelectItem>
                    <SelectItem value="stdio">STDIO</SelectItem>
                    <SelectItem value="sse">SSE</SelectItem>
                    <SelectItem value="streamable">Streamable HTTP</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={isPublic.toString()}
                  onValueChange={(value: string) =>
                    setIsPublic(value === "all" ? "all" : parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="公开状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">公开状态</SelectItem>
                    <SelectItem value="1">公开</SelectItem>
                    <SelectItem value="0">私有</SelectItem>
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

        {/* 服务器列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>服务器列表</span>
              <span className="text-muted-foreground text-sm font-normal">
                共 {total} 个服务器
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : servers.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                暂无数据
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>服务器名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>服务器类型</TableHead>
                      <TableHead>编译类型</TableHead>
                      <TableHead>Git 仓库</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servers.map((server) => (
                      <TableRow key={server.id}>
                        <TableCell className="font-medium">
                          {server.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {server.server_title}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {server.server_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate"
                            title={server.description}
                          >
                            {server.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getServerTypeBadge(server.server_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {server.compile_type === "package" ? (
                              <Package className="h-3 w-3" />
                            ) : (
                              <Terminal className="h-3 w-3" />
                            )}
                            {getCompileTypeBadge(server.compile_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {server.git ? (
                            <a
                              href={server.git}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <GitBranch className="h-3 w-3" />
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{formatDate(server.created_time)}</TableCell>
                        <TableCell>{formatDate(server.updated_time)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetail(server.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditServer(server.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
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

      {/* MCP详情模态框 */}
      <McpDetailModal
        open={detailModalOpen}
        onOpenChange={handleCloseDetailModal}
        serverId={selectedServerId}
      />

      {/* MCP编辑模态框 */}
      <McpEditModal
        open={editModalOpen}
        onOpenChange={handleCloseEditModal}
        serverId={selectedEditServerId}
        onSuccess={handleEditSuccess}
      />
    </AdminLayout>
  )
}
