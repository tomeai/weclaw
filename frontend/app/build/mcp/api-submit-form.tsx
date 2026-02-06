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

interface ApiSubmitFormProps {
  onSuccess?: (data: any) => void
  onCancel?: () => void
  disabled?: boolean
}

export function ApiSubmitForm({
  onSuccess,
  disabled = false,
}: ApiSubmitFormProps) {
  const [formData, setFormData] = useState({
    server_title: "",
    server_type: "" as "hosted" | "local" | "",
    request_method: "GET" as "GET" | "POST",
    request_url: "",
    auth_type: "none" as "none" | "bearer" | "apikey" | "basic",
    auth_token: "",
    api_key: "",
    username: "",
    password: "",
    headers: "",
    params: "",
    description: "",
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
    if (!formData.request_url.trim()) {
      setError("请输入请求地址")
      return false
    }
    if (!formData.request_url.startsWith('http://') && !formData.request_url.startsWith('https://')) {
      setError("请求地址必须以http://或https://开头")
      return false
    }
    
    // 验证鉴权信息
    if (formData.auth_type === "bearer" && !formData.auth_token.trim()) {
      setError("请输入Bearer Token")
      return false
    }
    if (formData.auth_type === "apikey" && !formData.api_key.trim()) {
      setError("请输入API Key")
      return false
    }
    if (formData.auth_type === "basic" && (!formData.username.trim() || !formData.password.trim())) {
      setError("请输入用户名和密码")
      return false
    }

    // 验证JSON格式
    if (formData.headers.trim()) {
      try {
        JSON.parse(formData.headers.trim())
      } catch (parseError) {
        setError("请求头格式错误，请输入有效的JSON格式")
        return false
      }
    }
    
    if (formData.params.trim()) {
      try {
        JSON.parse(formData.params.trim())
      } catch (parseError) {
        setError("请求参数格式错误，请输入有效的JSON格式")
        return false
      }
    }

    return true
  }

  const buildMcpConfig = () => {
    const config: any = {
      type: "streamableHttp", // 默认使用HTTP类型
      url: formData.request_url,
    }

    // 添加鉴权信息
    if (formData.auth_type !== "none") {
      const headers: any = {}
      
      if (formData.auth_type === "bearer") {
        headers["Authorization"] = `Bearer ${formData.auth_token}`
      } else if (formData.auth_type === "apikey") {
        headers["X-API-Key"] = formData.api_key
      } else if (formData.auth_type === "basic") {
        // Basic认证会在headers中处理
        const credentials = btoa(`${formData.username}:${formData.password}`)
        headers["Authorization"] = `Basic ${credentials}`
      }

      // 添加自定义headers
      if (formData.headers.trim()) {
        try {
          const customHeaders = JSON.parse(formData.headers.trim())
          Object.assign(headers, customHeaders)
        } catch (e) {
          console.warn("自定义headers解析失败")
        }
      }

      if (Object.keys(headers).length > 0) {
        config.headers = headers
      }
    }

    // 添加参数
    if (formData.params.trim()) {
      try {
        const params = JSON.parse(formData.params.trim())
        config.params = params
      } catch (e) {
        console.warn("参数解析失败")
      }
    }

    return {
      type: "streamableHttp",
      config: {
        mcpServers: {
          [formData.server_title.toLowerCase().replace(/\s+/g, '_')]: config
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 构建MCP配置
      const mcpServersObject = buildMcpConfig()

      // 准备提交数据
      const submitData = {
        server_title: formData.server_title,
        server_type: formData.server_type,
        git: "", // 接口提交方式不需要git地址
        mcpServers: mcpServersObject,
        description: formData.description,
        submit_type: "api" // 标记为接口提交类型
      }

      // 调用父组件的onSuccess回调，让父组件处理API调用
      await onSuccess?.(submitData)
    } catch (err) {
      setError("提交失败，请重试")
      console.error("提交API失败:", err)
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="request_method">请求方式 *</Label>
            <div className="mt-2">
              <Select
                value={formData.request_method}
                onValueChange={(value: "GET" | "POST") =>
                  handleInputChange("request_method", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="request_url">请求地址 *</Label>
            <div className="mt-2">
              <Input
                id="request_url"
                value={formData.request_url}
                onChange={(e) => handleInputChange("request_url", e.target.value)}
                placeholder="https://api.example.com/mcp"
                disabled={isSubmitting || disabled}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="auth_type">鉴权方式</Label>
          <div className="mt-2">
            <Select
              value={formData.auth_type}
              onValueChange={(value: "none" | "bearer" | "apikey" | "basic") =>
                handleInputChange("auth_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择鉴权方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无鉴权</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="apikey">API Key</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 鉴权信息输入 */}
        {formData.auth_type === "bearer" && (
          <div>
            <Label htmlFor="auth_token">Bearer Token *</Label>
            <div className="mt-2">
              <Input
                id="auth_token"
                type="password"
                value={formData.auth_token}
                onChange={(e) => handleInputChange("auth_token", e.target.value)}
                placeholder="输入Bearer Token"
                disabled={isSubmitting || disabled}
              />
            </div>
          </div>
        )}

        {formData.auth_type === "apikey" && (
          <div>
            <Label htmlFor="api_key">API Key *</Label>
            <div className="mt-2">
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => handleInputChange("api_key", e.target.value)}
                placeholder="输入API Key"
                disabled={isSubmitting || disabled}
              />
            </div>
          </div>
        )}

        {formData.auth_type === "basic" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">用户名 *</Label>
              <div className="mt-2">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="输入用户名"
                  disabled={isSubmitting || disabled}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">密码 *</Label>
              <div className="mt-2">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="输入密码"
                  disabled={isSubmitting || disabled}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="headers">自定义请求头 (JSON格式)</Label>
          <div className="mt-2">
            <Textarea
              id="headers"
              value={formData.headers}
              onChange={(e) => handleInputChange("headers", e.target.value)}
              placeholder={`{
    "Content-Type": "application/json",
    "X-Custom-Header": "value"
}`}
              disabled={isSubmitting || disabled}
              rows={4}
            />
            <p className="text-muted-foreground mt-2 text-sm">
              可选：输入额外的请求头，使用JSON格式
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="params">请求参数 (JSON格式)</Label>
          <div className="mt-2">
            <Textarea
              id="params"
              value={formData.params}
              onChange={(e) => handleInputChange("params", e.target.value)}
              placeholder={`{
    "param1": "value1",
    "param2": "value2"
}`}
              disabled={isSubmitting || disabled}
              rows={4}
            />
            <p className="text-muted-foreground mt-2 text-sm">
              可选：输入请求参数，使用JSON格式
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="description">描述信息</Label>
          <div className="mt-2">
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="请描述您的MCP服务器功能和使用说明"
              disabled={isSubmitting || disabled}
              rows={3}
            />
            <p className="text-muted-foreground mt-2 text-sm">
              可选：提供详细的服务器描述信息
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
