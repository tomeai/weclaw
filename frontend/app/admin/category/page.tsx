"use client"

import { AdminSidebar } from "@/app/components/admin/admin-sidebar"
import AdminLayout from "@/app/components/layout/admin-layout"
import {
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

  // 获取分类列表
  const fetchCategories = async (params: McpAdminCategoryParams = {}) => {
    try {
      setLoading(true)
      const response = await getMcpAdminCategories({
        is_recommend: isRecommend,
        ...params,
      })

      if (response.code === 200) {
        setCategories(response.data.items)
        setTotal(response.data.total)
        setTotalPages(response.data.total_pages)
        setCurrentPage(response.data.page)
      } else {
        toast.error(`获取分类列表失败: ${response.msg}`)
      }
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增分类
            </Button>
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
