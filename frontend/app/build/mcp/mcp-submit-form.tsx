"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { useState } from "react"

interface McpSubmitFormProps {
  onSuccess?: (data: any) => void
  onCancel?: () => void
  disabled?: boolean
}

/** 校验 mcpServers JSON 配置 */
function validateMcpServersJson(json: any): string | null {
  if (!json || typeof json !== "object") {
    return "MCP服务器配置必须是一个有效的JSON对象"
  }

  if (json.config && json.config.mcpServers) {
    const mcpServers = json.config.mcpServers
    if (typeof mcpServers !== "object" || Array.isArray(mcpServers)) {
      return "mcpServers必须是一个对象"
    }

    for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
      if (typeof serverConfig !== "object" || serverConfig === null) {
        return `服务器 "${serverName}" 的配置必须是一个对象`
      }

      const config = serverConfig as any
      if (!config.type) {
        return `服务器 "${serverName}" 必须指定type字段`
      }

      if (
        (config.type === "sse" || config.type === "streamableHttp") &&
        !config.url
      ) {
        return `服务器 "${serverName}" 的type为${config.type}时必须指定url字段`
      }
    }
  }

  return null
}

export function McpSubmitForm({
  onSuccess,
  disabled = false,
}: McpSubmitFormProps) {
  const [formData, setFormData] = useState({
    server_title: "",
    description: "",
    mcpServers: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 校验标题
    if (!formData.server_title.trim()) {
      setError("请输入服务器标题")
      return
    }

    // 校验 mcpServers 非空
    if (!formData.mcpServers.trim()) {
      setError("请输入MCP服务器配置")
      return
    }

    // 解析 JSON
    let mcpServersObject: any
    try {
      mcpServersObject = JSON.parse(formData.mcpServers.trim())
    } catch {
      setError("MCP服务器配置格式错误，请输入有效的JSON格式")
      return
    }

    // 校验 JSON 结构
    const jsonError = validateMcpServersJson(mcpServersObject)
    if (jsonError) {
      setError(jsonError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSuccess?.({
        server_title: formData.server_title.trim(),
        description: formData.description,
        mcpServers: mcpServersObject,
      })
    } catch (err: any) {
      setError(err.message || "提交失败，请重试")
      console.error("提交MCP失败:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="server_title">服务器标题 *</Label>
          <div className="mt-2">
            <Input
              id="server_title"
              value={formData.server_title}
              onChange={(e) =>
                handleInputChange("server_title", e.target.value)
              }
              placeholder="输入MCP服务器的标题"
              disabled={isSubmitting || disabled}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">描述</Label>
          <div className="mt-2">
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="请输入MCP服务器的描述信息"
              disabled={isSubmitting || disabled}
              rows={3}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="mcpServers">MCP服务器配置 *</Label>
          <div className="mt-2">
            <Textarea
              id="mcpServers"
              value={formData.mcpServers}
              onChange={(e) => handleInputChange("mcpServers", e.target.value)}
              placeholder={`{
  "mcpServers": {
    "amap-maps": {
      "args": [
        "-y",
        "@amap/amap-maps-mcp-server"
      ],
      "command": "npx",
      "env": {
        "AMAP_MAPS_API_KEY": ""
      }
    }
  }
}`}
              disabled={isSubmitting || disabled}
              rows={12}
            />
            <p className="text-muted-foreground mt-2 text-sm">
              请输入您的MCP服务器配置，按照上面的JSON格式填写
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting || disabled}>
          {isSubmitting ? "提交中..." : "提交"}
        </Button>
      </div>
    </form>
  )
}
