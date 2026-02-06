"use client"

import {
  getMcpAdminServerDetail,
  McpAdminServerDetailItem,
} from "@/app/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ExternalLink,
  GitBranch,
  Package,
  Terminal,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"

interface McpDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: number | null
}

export function McpDetailModal({
  open,
  onOpenChange,
  serverId,
}: McpDetailModalProps) {
  const [serverDetail, setServerDetail] = useState<McpAdminServerDetailItem | null>(null)
  const [loading, setLoading] = useState(false)

  // 获取服务器详情
  const fetchServerDetail = async (id: number) => {
    try {
      setLoading(true)
      const data = await getMcpAdminServerDetail(id)
      setServerDetail(data)
    } catch (error) {
      console.error("Error fetching server detail:", error)
    } finally {
      setLoading(false)
    }
  }

  // 当模态框打开且有serverId时获取详情
  useEffect(() => {
    console.log('模态框状态变化:', { open, serverId })
    if (open && serverId) {
      fetchServerDetail(serverId)
    } else {
      setServerDetail(null)
    }
  }, [open, serverId])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>MCP服务器详情</DialogTitle>
          <DialogDescription>
            查看MCP服务器的详细信息和配置
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">加载中...</span>
          </div>
        ) : serverDetail ? (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      服务器ID
                    </label>
                    <p className="text-sm">{serverDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      服务器名称
                    </label>
                    <p className="text-sm">{serverDetail.server_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      分类
                    </label>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">
                        {serverDetail.category?.name || "未分类"}
                      </Badge>
                      {serverDetail.category?.is_recommend === 1 && (
                        <Badge variant="secondary">推荐</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      服务器类型
                    </label>
                    <div className="flex items-center gap-1">
                      {getServerTypeBadge(serverDetail.server_type)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      编译类型
                    </label>
                    <div className="flex items-center gap-1">
                      {serverDetail.compile_type === "package" ? (
                        <Package className="h-3 w-3" />
                      ) : (
                        <Terminal className="h-3 w-3" />
                      )}
                      {getCompileTypeBadge(serverDetail.compile_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <div>
                <h3 className="text-lg font-semibold mb-2">描述</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {serverDetail.description}
                </p>
              </div>

              {/* Git仓库 */}
              {serverDetail.git && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Git仓库</h3>
                  <a
                    href={serverDetail.git}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <GitBranch className="h-4 w-4" />
                    <span className="truncate">{serverDetail.git}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* 作者信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-2">作者信息</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={serverDetail.user.avatar}
                      alt={serverDetail.user.username}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {serverDetail.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">作者</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无数据
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
