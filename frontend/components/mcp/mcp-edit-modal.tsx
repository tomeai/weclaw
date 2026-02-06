"use client"

import {
  getMcpAdminCategories,
  McpAdminCategoryItem,
  updateMcpAdminServer,
  McpAdminServerUpdateParams,
  McpAdminServerDetailItem,
  getMcpAdminServerDetail,
} from "@/app/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea"
import {
  ExternalLink,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface McpEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: number | null
  onSuccess?: () => void
}

export function McpEditModal({
  open,
  onOpenChange,
  serverId,
  onSuccess,
}: McpEditModalProps) {
  const [serverDetail, setServerDetail] = useState<McpAdminServerDetailItem | null>(null)
  const [categories, setCategories] = useState<McpAdminCategoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState<McpAdminServerUpdateParams>({
    category_id: 0,
    description: "",
    server_title: "",
    is_public: 0 
  })

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const data = await getMcpAdminCategories()
      setCategories(data.items)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // 获取服务器详情
  const fetchServerDetail = async (id: number) => {
    try {
      setLoading(true)
      const data = await getMcpAdminServerDetail(id)
      setServerDetail(data)
      setFormData({
        category_id: data.category?.id || 0,
        description: data.description || "",
        server_title: data.server_title || "",
        is_public: data.is_public || 0
      })
    } catch (error) {
      console.error("Error fetching server detail:", error)
    } finally {
      setLoading(false)
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serverId) return

    try {
      setSubmitting(true)
      await updateMcpAdminServer(serverId, formData)
      toast.success("MCP服务器更新成功")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error updating server:", error)
      toast.error("更新MCP服务器失败")
    } finally {
      setSubmitting(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (
    field: keyof McpAdminServerUpdateParams,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // 当模态框打开且有serverId时获取详情和分类
  useEffect(() => {
    if (open && serverId) {
      fetchServerDetail(serverId)
      fetchCategories()
    }
  }, [open, serverId])

  // 重置表单当模态框关闭时
  useEffect(() => {
    if (!open) {
      setServerDetail(null)
      setFormData({
        category_id: 0,
        description: "",
        server_title: "",
        is_public: 0
      })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑MCP服务器</DialogTitle>
          <DialogDescription>
            修改MCP服务器的基本信息
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">加载中...</span>
          </div>
        ) : serverDetail ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 服务器标题 */}
            <div className="space-y-2">
              <Label htmlFor="server_title">服务器标题 *</Label>
              <Input
                id="server_title"
                value={formData.server_title}
                onChange={(e) => handleInputChange("server_title", e.target.value)}
                placeholder="请输入服务器标题"
                required
              />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category_id">分类 *</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) => handleInputChange("category_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="请输入服务器描述"
                rows={4}
                required
              />
            </div>

            {/* 公开状态 */}
            <div className="space-y-2">
              <Label htmlFor="is_public">公开状态 *</Label>
              <Select
                value={formData.is_public.toString()}
                onValueChange={(value) => handleInputChange("is_public", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择公开状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">私有</SelectItem>
                  <SelectItem value="1">公开</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 只读信息展示 */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">服务器名称:</span>
                  <span className="ml-2">{serverDetail.server_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">当前分类:</span>
                  <span className="ml-2">
                    {serverDetail.category?.name || "未分类"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">服务器类型:</span>
                  <span className="ml-2">
                    {serverDetail.server_type === "hosted" ? "托管" : "本地"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">编译类型:</span>
                  <span className="ml-2">
                    {serverDetail.compile_type === "package" ? "包" : "STDIO"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Git仓库:</span>
                  {serverDetail.git ? (
                    <div className="mt-1">
                      <a
                        href={serverDetail.git}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <span className="truncate">{serverDetail.git}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  ) : (
                    <span className="ml-2">无</span>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无数据
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
