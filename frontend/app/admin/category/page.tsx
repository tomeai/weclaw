"use client"

import { AdminSidebar } from "@/app/components/admin/admin-sidebar"
import AdminLayout from "@/app/components/layout/admin-layout"
import {
  createMcpAdminCategory,
  getMcpAdminCategories,
  McpAdminCategoryItem,
  McpAdminCategoryParams,
} from "@/app/lib/api"
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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<McpAdminCategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [isRecommend, setIsRecommend] = useState<number>(-1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIsRecommend, setNewCategoryIsRecommend] = useState<number>(0)

  // 获取分类列表
  const fetchCategories = async (params: McpAdminCategoryParams = {}) => {
    try {
      setLoading(true)
      const data = await getMcpAdminCategories({
        is_recommend: isRecommend,
        ...params,
      })
      setCategories(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
      setCurrentPage(data.page)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("获取分类列表失败")
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchCategories()
  }, [currentPage, pageSize, isRecommend])

  // 分页处理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // 刷新列表
  const handleRefresh = () => {
    fetchCategories()
  }

  // 格式化时间
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 获取推荐状态徽章
  const getRecommendBadge = (isRecommend: number) => {
    if (isRecommend === 1) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          推荐
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        非推荐
      </Badge>
    )
  }

  // 创建新分类
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

  // 重置创建表单
  const resetCreateForm = () => {
    setNewCategoryName("")
    setNewCategoryIsRecommend(0)
    setCreateLoading(false)
  }

  // 处理对话框关闭
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetCreateForm()
    }
    setIsCreateDialogOpen(open)
  }

  return (
    <AdminLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">分类管理</h1>
            <p className="text-muted-foreground">
              管理所有 MCP 服务器分类，包括查看、编辑和删除操作
            </p>
          </div>
          <div className="flex gap-2">
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
                      onValueChange={(value: string) =>
                        setNewCategoryIsRecommend(Number(value))
                      }
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
            <CardTitle>筛选条件</CardTitle>
            <CardDescription>
              根据推荐状态筛选分类
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <Select
                  value={isRecommend.toString()}
                  onValueChange={(value: string) => {
                    setIsRecommend(parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="推荐状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">全部分类</SelectItem>
                    <SelectItem value="1">推荐分类</SelectItem>
                    <SelectItem value="0">非推荐分类</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分类列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>分类列表</span>
              <span className="text-muted-foreground text-sm font-normal">
                共 {total} 个分类
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                加载中...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                暂无数据
              </div>
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
                        <TableCell className="font-medium">
                          {category.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {category.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRecommendBadge(category.is_recommend)}
                        </TableCell>
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
