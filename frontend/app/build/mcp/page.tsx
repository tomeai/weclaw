"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { submitMcpServer } from "@/lib/mcp"
import { CheckCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { McpSubmitForm } from "./mcp-submit-form"
import LayoutApp from "@/components/layout/layout-app"

export default function SubmitMcpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setSubmitError(null)

    try {
      await submitMcpServer(data)
      setSubmitStatus("success")
      toast({
        title: "提交成功",
        description: "MCP服务器已成功提交，正在审核中",
        status: "success",
      })
    } catch (error: any) {
      console.error("提交MCP失败:", error)
      setSubmitStatus("error")
      setSubmitError(error.message || "提交失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccess = () => {
    // 提交成功后可以显示成功状态，而不是立即跳转
    setTimeout(() => {
      window.location.href = "/mcp"
    }, 3000)
  }

  const handleCancel = () => {
    window.location.href = "/mcp"
  }

  // 如果提交成功，显示成功页面
  if (submitStatus === "success") {
    return (
      <LayoutApp>
        <div className="container mx-auto py-8 pt-24">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="mb-2 text-2xl font-bold">提交成功！</h2>
                <p className="text-muted-foreground mb-6">
                  您的MCP服务器已成功提交，我们将在24小时内完成审核。
                </p>
                <p className="text-muted-foreground mb-6 text-sm">
                  页面将在3秒后自动跳转到MCP列表页面...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </LayoutApp>
    )
  }

  return (
    <LayoutApp>
      <div className="container mx-auto py-8 pt-24">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>提交MCP服务器</CardTitle>
            <p className="text-muted-foreground text-sm">
              填写下方表单来提交您的MCP服务器，我们将尽快审核并上线。
            </p>
          </CardHeader>
          <CardContent className="pt-8">
            {submitStatus === "error" && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="mb-1 font-medium text-red-800">提交失败</p>
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <Tabs defaultValue="config" className="w-full" onValueChange={(value) => {
              if (value === "api") {
                toast({
                  title: "敬请期待",
                  description: "HTTP接口提交功能正在开发中，请先使用MCP配置提交",
                  status: "info",
                })
              }
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">MCP配置提交</TabsTrigger>
                <TabsTrigger value="api">HTTP接口提交</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    通过MCP配置文件提交，适用于已有完整MCP配置的服务器。
                  </p>
                  <McpSubmitForm
                    onSuccess={handleSubmit}
                    onCancel={handleCancel}
                    disabled={isSubmitting}
                  />
                </div>
              </TabsContent>

              <TabsContent value="api" className="mt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Loader2 className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">敬请期待</h3>
                  <p className="text-muted-foreground text-sm">
                    HTTP接口提交功能正在开发中，请先使用MCP配置提交。
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {isSubmitting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="flex items-center space-x-3 rounded-lg bg-white p-6 shadow-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span>正在提交，请稍候...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutApp>
  )
}
