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
  createSkillAdminCategory,
  deleteSkillAdmin,
  getSkillAdminCategories,
  getSkillAdminServers,
  SkillAdminCategoryItem,
  SkillAdminCategoryParams,
  SkillAdminItem,
  SkillAdminSearchParams,
  SkillCategory,
  getSkillCategories,
} from "@/lib/skill"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Star,
  Tags,
  Trash2,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import AdminLayout from "@/components/layout/admin-layout"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"

export default function SkillAdminPage() {
  // ── Skill 列表状态 ──────────────────────────────────────
  const [skills, setSkills] = useState<SkillAdminItem[]>([])
  const [filterCategories, setFilterCategories] = useState<SkillCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [categoryId, setCategoryId] = useState<number | "all">("all")

  // ── 分类管理状态 ──────────────────────────────────────
  const [categories, setCategories] = useState<SkillAdminCategoryItem[]>([])
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

  // ── Skill 列表方法 ──────────────────────────────────────
  const fetchSkills = async (params: SkillAdminSearchParams = {}) => {
    try {
      setLoading(true)
      const response = await getSkillAdminServers({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword,
        category_id: categoryId === "all" ? undefined : categoryId,
        ...params,
      })
      setSkills(response.items)
      setTotal(response.total)
      setTotalPages(response.total_pages)
      setCurrentPage(response.page)
    } catch (error) {
      console.error("Error fetching skills:", error)
      toast.error("获取Skill列表失败")
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterCategories = async () => {
    try {
      const result = await getSkillCategories()
      setFilterCategories(result)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchFilterCategories()
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [currentPage, pageSize])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchSkills({ page: 1 })
  }

  const handleReset = () => {
    setSearchKeyword("")
    setCategoryId("all")
    setCurrentPage(1)
    fetchSkills({ page: 1, keyword: "", category_id: undefined })
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleDelete = async (skillId: number) => {
    if (!confirm("确定要删除该 Skill 吗？")) return
    try {
      await deleteSkillAdmin(skillId)
      toast.success("删除成功")
      fetchSkills()
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast.error("删除失败")
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // ── 分类管理方法 ──────────────────────────────────────
  const fetchCategories = async (params: SkillAdminCategoryParams = {}) => {
    try {
      setCatLoading(true)
      const data = await getSkillAdminCategories({
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
    if (page >= 1 && page <= catTotalPages) setCatCurrentPage(page)
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
      await createSkillAdminCategory({
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill管理</h1>
          <p className="text-muted-foreground">管理所有 Skill 及分类</p>
        </div>

        <Tabs defaultValue="skills">
          <TabsList>
            <TabsTrigger value="skills">
              <Zap className="mr-1.5 h-4 w-4" />
              Skill列表
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tags className="mr-1.5 h-4 w-4" />
              分类管理
            </TabsTrigger>
          </TabsList>

          {/* ── Skill 列表 Tab ── */}
          <TabsContent value="skills" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>搜索和筛选</CardTitle>
                <CardDescription>根据关键词、分类筛选 Skill</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="搜索Skill名称或描述..."
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
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分类</SelectItem>
                      {filterCategories.map((cat) => (
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
                    <Button variant="outline" onClick={() => fetchSkills()} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Skill列表</span>
                  <span className="text-muted-foreground text-sm font-normal">共 {total} 个Skill</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                    加载中...
                  </div>
                ) : skills.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Zap className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    暂无数据
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>描述</TableHead>
                          <TableHead>创建者</TableHead>
                          <TableHead>仓库</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead>更新时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skills.map((skill, index) => (
                          <TableRow key={skill.id ?? index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {skill.avatar ? (
                                  <img
                                    src={skill.avatar}
                                    alt={skill.title}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                    <Zap className="h-4 w-4" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{skill.title}</div>
                                  <div className="text-muted-foreground text-xs">{skill.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={skill.description || ""}>
                                {skill.description || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground text-sm">{skill.owner}</span>
                            </TableCell>
                            <TableCell>
                              {skill.repository ? (
                                <a
                                  href={skill.repository}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  仓库
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={skill.is_public ? "default" : "secondary"}>
                                {skill.is_public ? "公开" : "私有"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(skill.created_time)}</TableCell>
                            <TableCell>{formatDate(skill.updated_time)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => skill.id && handleDelete(skill.id)}
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
                      创建新的 Skill 分类，设置分类名称和推荐状态。
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
    </AdminLayout>
  )
}
