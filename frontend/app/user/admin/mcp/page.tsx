"use client"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  createMcpAdminCategory,
  getMcpAdminCategories,
  getMcpAdminServers,
  McpAdminCategoryItem,
  McpAdminCategoryParams,
  McpAdminServerItem,
  McpAdminServersParams,
} from "@/lib/mcp"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Tags,
  Terminal,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"

export default function McpAdminPage() {
  // ── 服务器列表状态 ──────────────────────────────────────
  const [servers, setServers] = useState<McpAdminServerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [serverType, setServerType] = useState<"hosted" | "local" | "all">("all")
  const [compileType, setCompileType] = useState<"package" | "stdio" | "all">("all")
  const [isPublic, setIsPublic] = useState<number | "all">(1)
  const [transport, setTransport] = useState<"stdio" | "sse" | "streamable" | "all">("all")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEditServerId, setSelectedEditServerId] = useState<number | null>(null)

  // ── 分类管理状态 ──────────────────────────────────────
  const [categories, setCategories] = useState<McpAdminCategoryItem[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [catTotal, setCatTotal] = useState(0)
  const [catCurrentPage, setCatCurrentPage] = useState(1)
  const [catPageSize] = useState(20)
  const [catTotalPages, setCatTotalPages] = useState(1)
  const [isRecommend, setIsRecommend] = useState<number>(-1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIsRecommend, setNewCategoryIsRecommend] = useState<number>(0)

  // ── 服务器列表方法 ──────────────────────────────────────
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
      setServers(response.items)
      setTotal(response.total)
      setTotalPages(response.total_pages)
      setCurrentPage(response.page)
    } catch (error) {
      console.error("Error fetching MCP servers:", error)
      toast.error("获取服务器列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [currentPage, pageSize])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchServers()
  }

  const handleReset = () => {
    setSearchKeyword("")
    setServerType("all")
    setCompileType("all")
    setIsPublic(1)
    setTransport("all")
    setCurrentPage(1)
    fetchServers({
      page: 1,
      keyword: "",
      server_type: undefined,
      compile_type: undefined,
      is_public: 1,
      transport: undefined,
    })
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

  const getServerTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      hosted: "default",
      local: "secondary",
    }
    return <Badge variant={variants[type] || "outline"}>{type === "hosted" ? "托管" : "本地"}</Badge>
  }

  const getCompileTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      package: "default",
      stdio: "secondary",
    }
    return <Badge variant={variants[type] || "outline"}>{type === "package" ? "包" : "STDIO"}</Badge>
  }

  const handleViewDetail = (serverId: number) => {
    setSelectedServerId(serverId)
    setDetailModalOpen(true)
  }

  const handleEditServer = (serverId: number) => {
    setSelectedEditServerId(serverId)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    fetchServers()
  }

  // ── 分类管理方法 ──────────────────────────────────────
  const fetchCategories = async (params: McpAdminCategoryParams = {}) => {
    try {
      setCatLoading(true)
      const data = await getMcpAdminCategories({
        is_recommend: isRecommend,
        ...params,
      })
      setCategories(data.items)
      setCatTotal(data.total)
      setCatTotalPages(data.total_pages)
      setCatCurrentPage(data.page)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("获取分类列表失败")
    } finally {
      setCatLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [catCurrentPage, catPageSize, isRecommend])

  const handleCatPageChange = (page: number) => {
    if (page >= 1 && page <= catTotalPages) {
      setCatCurrentPage(page)
    }
  }

  const getRecommendBadge = (isRec: number) => {
    if (isRec === 1) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          推荐
        </Badge>
      )
    }
    return <Badge variant="secondary">非推荐</Badge>
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("请输入分类名称")
      return
    }
    try {
      setCreateLoading(true)
      await createMcpAdminCategory({
        name: newCategoryName.trim(),
        is_recommend: newCategoryIsRecommend,
      })
      toast.success("分类创建成功")
      setIsCreateDialogOpen(false)
      setNewCategoryName("")
      setNewCategoryIsRecommend(0)
      fetchCategories()
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("创建分类失败")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNewCategoryName("")
      setNewCategoryIsRecommend(0)
      setCreateLoading(false)
    }
    setIsCreateDialogOpen(open)
  }

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP管理</h1>
          <p className="text-muted-foreground">管理所有 MCP 服务器及分类</p>
        </div>

        <Tabs defaultValue="servers">
          <TabsList>
            <TabsTrigger value="servers">服务器列表</TabsTrigger>
            <TabsTrigger value="categories">
              <Tags className="mr-1.5 h-4 w-4" />
              分类管理
            </TabsTrigger>
          </TabsList>

          {/* ── 服务器列表 Tab ── */}
          <TabsContent value="servers" className="space-y-4 mt-4">
            {/* 搜索和筛选 */}
            <Card>
              <CardHeader>
                <CardTitle>搜索和筛选</CardTitle>
                <CardDescription>
                  根据关键词、部署类型、协议类型或审核状态筛选 MCP 服务器
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                    onValueChange={(value: "hosted" | "local" | "all") => setServerType(value)}
                  >
                    <SelectTrigger className="w-[160px]">
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
                    onValueChange={(value: "stdio" | "sse" | "streamable" | "all") => setTransport(value)}
                  >
                    <SelectTrigger className="w-[160px]">
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
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="审核状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">审核状态</SelectItem>
                      <SelectItem value="1">已审核</SelectItem>
                      <SelectItem value="0">未审核</SelectItem>
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
                    <Button variant="outline" onClick={() => fetchServers()} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 服务器列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>服务器列表</span>
                  <span className="text-muted-foreground text-sm font-normal">共 {total} 个服务器</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                    加载中...
                  </div>
                ) : servers.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">暂无数据</div>
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
                          <TableHead>创建时间</TableHead>
                          <TableHead>更新时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {servers.map((server) => (
                          <TableRow key={server.id}>
                            <TableCell className="font-medium">{server.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{server.server_title}</div>
                                <div className="text-muted-foreground text-sm">{server.server_name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={server.description}>
                                {server.description}
                              </div>
                            </TableCell>
                            <TableCell>{getServerTypeBadge(server.server_type)}</TableCell>
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
                            <TableCell>{formatDate(server.created_time)}</TableCell>
                            <TableCell>{formatDate(server.updated_time)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewDetail(server.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditServer(server.id)}>
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

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                          显示第 {(currentPage - 1) * pageSize + 1} 到{" "}
                          {Math.min(currentPage * pageSize, total)} 条，共 {total} 条记录
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
                          <span className="text-sm">第 {currentPage} 页，共 {totalPages} 页</span>
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
          </TabsContent>

          {/* ── 分类管理 Tab ── */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Select
                  value={isRecommend.toString()}
                  onValueChange={(value: string) => {
                    setIsRecommend(parseInt(value))
                    setCatCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="推荐状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">全部分类</SelectItem>
                    <SelectItem value="1">推荐分类</SelectItem>
                    <SelectItem value="0">非推荐分类</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => fetchCategories()} disabled={catLoading}>
                  <RefreshCw className={`h-4 w-4 ${catLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新增分类
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>新增分类</DialogTitle>
                    <DialogDescription>
                      创建新的 MCP 服务器分类，设置分类名称和推荐状态。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">分类名称</Label>
                      <Input
                        id="name"
                        placeholder="请输入分类名称"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        disabled={createLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="recommend">推荐状态</Label>
                      <Select
                        value={newCategoryIsRecommend.toString()}
                        onValueChange={(value: string) => setNewCategoryIsRecommend(Number(value))}
                        disabled={createLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择推荐状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">非推荐</SelectItem>
                          <SelectItem value="1">推荐</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createLoading}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleCreateCategory}
                      disabled={createLoading || !newCategoryName.trim()}
                    >
                      {createLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          创建中...
                        </>
                      ) : (
                        "确认创建"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>分类列表</span>
                  <span className="text-muted-foreground text-sm font-normal">共 {catTotal} 个分类</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {catLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                    加载中...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">暂无数据</div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>分类名称</TableHead>
                          <TableHead>推荐状态</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead>更新时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{category.name}</div>
                            </TableCell>
                            <TableCell>{getRecommendBadge(category.is_recommend)}</TableCell>
                            <TableCell>{formatDate(category.created_time)}</TableCell>
                            <TableCell>{formatDate(category.updated_time)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm">
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

                    {catTotalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                          显示第 {(catCurrentPage - 1) * catPageSize + 1} 到{" "}
                          {Math.min(catCurrentPage * catPageSize, catTotal)} 条，共 {catTotal} 条记录
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCatPageChange(catCurrentPage - 1)}
                            disabled={catCurrentPage <= 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            上一页
                          </Button>
                          <span className="text-sm">第 {catCurrentPage} 页，共 {catTotalPages} 页</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCatPageChange(catCurrentPage + 1)}
                            disabled={catCurrentPage >= catTotalPages}
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
          </TabsContent>
        </Tabs>
      </div>

      <McpDetailModal
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open)
          if (!open) setSelectedServerId(null)
        }}
        serverId={selectedServerId}
      />
      <McpEditModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open)
          if (!open) setSelectedEditServerId(null)
        }}
        serverId={selectedEditServerId}
        onSuccess={handleEditSuccess}
      />
    </AdminLayout>
  )
}
