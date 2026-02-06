"use client"

import { ChatContainer } from "@/components/prompt-kit/chat-container"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/prompt-kit/message"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Database,
  Globe,
  MessageCircle,
  Send,
  Settings,
  Upload,
} from "lucide-react"
import { useState } from "react"
import LayoutApp from "@/components/layout/layout-app"

export default function AgentCreatePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: [] as string[],
    systemPrompt: "",
    openingMessage: "",
    model: "",
    temperature: 0.7,
    maxTokens: 4000,
    enableMemory: false,
    selectedMCPs: [] as string[],
    selectedKnowledgeBases: [] as string[],
    selectedDatabases: [] as string[],
    enableWebSearch: false,
    enableImageUpload: false,
  })

  type MessageRole = "assistant" | "user"

  interface ChatMessage {
    id: number
    role: MessageRole
    content: string
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "你好！我是你的Agent助手，我可以帮助你测试和调试你正在创建的Agent。你可以问我任何问题，或者让我模拟你的Agent的行为。",
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      content: currentMessage,
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    // 模拟AI回复
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant" as const,
        content: `基于你当前的Agent配置（${formData.name || "未命名"}），我可以帮你测试功能。你设置的提示词是："${formData.systemPrompt.substring(0, 100)}${formData.systemPrompt.length > 100 ? "..." : ""}"，开场白是："${formData.openingMessage || "未设置"}"。有什么具体问题需要测试吗？`,
      }
      setChatMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("创建Agent:", formData)
    // 这里添加创建Agent的逻辑
  }

  return (
    <LayoutApp>
      <div className="mx-auto w-full max-w-7xl px-4 pt-24 pb-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">创建Agent</h1>
            <p className="text-muted-foreground">
              创建一个自定义的AI智能体，配置其行为和能力
            </p>
          </div>
          <Button type="submit">创建智能体</Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-6">
            {/* 左侧区域 - 基础信息配置 */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">基础信息</CardTitle>
                  <CardDescription>
                    设置Agent的名称、描述和核心配置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Agent名称 *</Label>
                      <Input
                        id="name"
                        placeholder="输入Agent名称"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">描述 *</Label>
                      <Textarea
                        id="description"
                        placeholder="描述Agent的功能和用途"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* 系统提示词 */}
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">系统提示词 *</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="输入系统提示词，定义Agent的角色、行为准则和回答方式"
                      value={formData.systemPrompt}
                      onChange={(e) =>
                        handleInputChange("systemPrompt", e.target.value)
                      }
                      rows={6}
                      className="resize-none"
                      required
                    />
                  </div>

                  {/* 开场白 */}
                  <div className="space-y-2">
                    <Label htmlFor="openingMessage">开场白</Label>
                    <Textarea
                      id="openingMessage"
                      placeholder="设置Agent的默认开场白"
                      value={formData.openingMessage}
                      onChange={(e) =>
                        handleInputChange("openingMessage", e.target.value)
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 中间区域 - 设置配置 */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Agent设置</CardTitle>
                  <CardDescription>配置Agent的功能和能力</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* MCP选择 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <Label className="text-sm font-medium">MCP选择</Label>
                    </div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择MCP工具" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcp1">MCP工具1</SelectItem>
                        <SelectItem value="mcp2">MCP工具2</SelectItem>
                        <SelectItem value="mcp3">MCP工具3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 知识库选择 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <Label className="text-sm font-medium">知识库选择</Label>
                    </div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择知识库" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kb1">知识库1</SelectItem>
                        <SelectItem value="kb2">知识库2</SelectItem>
                        <SelectItem value="kb3">知识库3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 数据库选择 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <Label className="text-sm font-medium">数据库选择</Label>
                    </div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择数据库" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="db1">数据库1</SelectItem>
                        <SelectItem value="db2">数据库2</SelectItem>
                        <SelectItem value="db3">数据库3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* 功能开关 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <Label className="text-sm font-medium">
                          开启联网搜索
                        </Label>
                      </div>
                      <Switch
                        checked={formData.enableWebSearch}
                        onCheckedChange={(checked) =>
                          handleInputChange("enableWebSearch", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <Label className="text-sm font-medium">
                          支持上传图片
                        </Label>
                      </div>
                      <Switch
                        checked={formData.enableImageUpload}
                        onCheckedChange={(checked) =>
                          handleInputChange("enableImageUpload", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧区域 - Agent助手问答 */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="flex flex-col" style={{ minHeight: "600px" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5" />
                    Agent助手问答
                  </CardTitle>
                  <CardDescription>与你的Agent助手进行对话测试</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  {/* 聊天消息区域 */}
                  <ScrollArea className="flex-1 pr-4">
                    <ChatContainer className="space-y-4">
                      {chatMessages.map((message) => (
                        <Message key={message.id}>
                          <MessageAvatar
                            src={
                              message.role === "assistant"
                                ? "/bot-avatar.png"
                                : "/user-avatar.png"
                            }
                            alt={
                              message.role === "assistant" ? "Agent" : "用户"
                            }
                            fallback={
                              message.role === "assistant" ? "🤖" : "👤"
                            }
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {message.role === "assistant"
                                  ? "Agent助手"
                                  : "你"}
                              </span>
                            </div>
                            <MessageContent markdown>
                              {message.content}
                            </MessageContent>
                          </div>
                        </Message>
                      ))}
                      {isLoading && (
                        <Message>
                          <MessageAvatar
                            src="/bot-avatar.png"
                            alt="Agent"
                            fallback="🤖"
                          />
                          <div className="flex-1">
                            <div className="text-muted-foreground text-sm">
                              Agent正在思考...
                            </div>
                          </div>
                        </Message>
                      )}
                    </ChatContainer>
                  </ScrollArea>

                  {/* 输入区域 */}
                  <div className="border-t pt-4">
                    <PromptInput
                      value={currentMessage}
                      onValueChange={setCurrentMessage}
                      onSubmit={handleSendMessage}
                      isLoading={isLoading}
                    >
                      <PromptInputTextarea
                        placeholder="输入你的问题..."
                        disabled={isLoading}
                      />
                      <PromptInputActions>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim() || isLoading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </PromptInputActions>
                    </PromptInput>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </LayoutApp>
  )
}
