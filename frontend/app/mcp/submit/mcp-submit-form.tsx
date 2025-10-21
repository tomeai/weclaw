"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { AlertCircle } from "lucide-react"
import { useState } from "react"

interface McpSubmitFormProps {
  onSuccess?: (data: any) => void
  onCancel?: () => void
  disabled?: boolean
}

export function McpSubmitForm({
  onSuccess,
  disabled = false,
}: McpSubmitFormProps) {
  const [formData, setFormData] = useState({
    server_title: "",
    server_type: "" as "hosted" | "local" | "",
    git: "",
    mcpServers: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.server_title.trim()) {
      setError("请输入服务器标题")
      return false
    }
    if (!formData.server_type) {
      setError("请选择服务器类型")
      return false
    }
    if (!formData.git.trim()) {
      setError("请输入Git仓库地址")
      return false
    }
    if (!formData.mcpServers.trim()) {
      setError("请输入MCP服务器配置")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 将 mcpServers 字符串转换为 JSON 对象
      let mcpServersObject: any
      try {
        mcpServersObject = JSON.parse(formData.mcpServers.trim())
      } catch (parseError) {
        setError("MCP服务器配置格式错误，请输入有效的JSON格式")
        return
      }

      // 准备提交数据，将 mcpServers 作为对象传递
      const submitData = {
        ...formData,
        mcpServers: mcpServersObject
      }

      // 调用父组件的onSuccess回调，让父组件处理API调用
      await onSuccess?.(submitData)
    } catch (err) {
      setError("提交失败，请重试")
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
          <Label htmlFor="server_type">服务器类型 *</Label>
          <div className="mt-2">
            <Select
              value={formData.server_type}
              onValueChange={(value: "hosted" | "local") =>
                handleInputChange("server_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择服务器类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hosted">托管服务器</SelectItem>
                {/*<SelectItem value="local">本地服务器</SelectItem>*/}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="git">Git仓库地址 *</Label>
          <div className="mt-2">
            <Input
              id="git"
              value={formData.git}
              onChange={(e) => handleInputChange("git", e.target.value)}
              placeholder="https://github.com/username/repo.git"
              disabled={isSubmitting || disabled}
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
    "type": "{输入sse或streamableHttp}",
    "config": {
        "mcpServers": {
            "{输入您的MCP Server英文名}": {
                "type": "{输入sse或streamableHttp}",
                "url": "{输入https://服务域名/sse?key=你申请的key}",
                "headers": {
                    "Authorization":""
                },
                "params": {
                    "key1":"value1",
                    "key2":"value2"
                }
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
