"use client";

import { useUser } from "@/components/providers/user-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AUTH_DAILY_MESSAGE_LIMIT } from "@/lib/config";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, Clock, Languages, MessageSquare, Monitor, Moon, MoreHorizontal, Pencil, Plus, Save, Server, Settings, Star, Sun, User, Users, X, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";


// ---------- mock data (same as existing profile page) ----------
const mockUserMcps = [
  {
    id: "1",
    name: "Custom Analytics",
    description: "自定义数据分析MCP，支持多维度报表",
    status: "published" as const,
    calls: 89,
    rating: 4.6,
    tools: 5,
  },
  {
    id: "2",
    name: "Log Monitor",
    description: "实时日志监控与告警工具",
    status: "published" as const,
    calls: 45,
    rating: 4.3,
    tools: 3,
  },
  {
    id: "3",
    name: "Data Formatter",
    description: "通用数据格式转换工具（开发中）",
    status: "draft" as const,
    calls: 0,
    rating: 0,
    tools: 2,
  },
]

const mockUserAgents = [
  {
    id: "1",
    name: "智能数据助手",
    description: "集成多个MCP的数据分析Agent，支持自然语言查询和可视化",
    status: "published" as const,
    mcpCount: 3,
    users: 128,
    conversations: 1560,
  },
  {
    id: "2",
    name: "代码审查助手",
    description: "自动化代码审查Agent，支持多语言代码质量分析和建议",
    status: "published" as const,
    mcpCount: 2,
    users: 76,
    conversations: 890,
  },
]

// ---------- sidebar nav items ----------
type NavItem = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { key: "account", label: "我的账户", icon: User },
  { key: "mcp", label: "我的MCP", icon: Server },
  { key: "agent", label: "我的Agent", icon: Bot },
  { key: "scheduled", label: "定时任务", icon: Clock },
  { key: "settings", label: "系统设置", icon: Settings },
]

// ---------- panels ----------
function AccountPanel() {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nickname: user?.nickname ?? "",
    bio: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const messageUsage = user?.daily_message_count ?? 0
  const messageLimit = AUTH_DAILY_MESSAGE_LIMIT

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* User info header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.nickname} />
            <AvatarFallback className="text-xl">
              {user?.nickname?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">
              {user?.nickname ?? "用户"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {user?.email ?? "未设置邮箱"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing((v) => !v)}
          title={isEditing ? "取消编辑" : "编辑资料"}
        >
          {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>

      {/* Plan / usage card */}
      <div className="bg-muted/40 space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">免费</span>
          <Button size="sm" variant="secondary" className="h-7 text-xs">
            升级
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>每日消息</span>
          </div>
          <span className="font-medium">
            {messageUsage} / {messageLimit}
          </span>
        </div>
      </div>

      {/* Edit form — visible only when editing */}
      {isEditing && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acc-nickname">昵称</Label>
            <Input
              id="acc-nickname"
              value={formData.nickname}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nickname: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-email">邮箱</Label>
            <Input
              id="acc-email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-bio">个人简介</Label>
            <Textarea
              id="acc-bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((p) => ({ ...p, bio: e.target.value }))
              }
              rows={3}
              placeholder="介绍一下您自己..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-3.5 w-3.5" />
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function McpPanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {mockUserMcps.map((mcp) => (
          <div
            key={mcp.id}
            className="bg-muted/40 hover:bg-muted/60 flex items-start justify-between rounded-xl border p-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                <Server className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{mcp.name}</span>
                  <Badge
                    variant={
                      mcp.status === "published" ? "default" : "secondary"
                    }
                    className="h-4 px-1.5 text-[10px]"
                  >
                    {mcp.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                  {mcp.description}
                </p>
                {mcp.status === "published" && (
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {mcp.calls}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {mcp.rating}
                    </span>
                    <span>{mcp.tools} tools</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 shrink-0 text-xs">
              管理
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentPanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {mockUserAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-muted/40 hover:bg-muted/60 flex items-start justify-between rounded-xl border p-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                <Bot className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <Badge
                    variant={
                      agent.status === "published" ? "default" : "secondary"
                    }
                    className="h-4 px-1.5 text-[10px]"
                  >
                    {agent.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                  {agent.description}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    {agent.mcpCount} MCP
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {agent.users}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {agent.conversations}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 shrink-0 text-xs">
              管理
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- scheduled task panel ----------
type ScheduledTask = {
  id: string
  title: string
  scheduledAt: string
  enabled: boolean
  completed: boolean
}

const mockScheduledTasks: ScheduledTask[] = [
  { id: "1", title: "AI新闻摘要", scheduledAt: "2026年2月17日 16:00", enabled: false, completed: false },
]

const AGENT_OPTIONS = [
  { id: "general", label: "通用" },
  { id: "doc", label: "文档" },
  { id: "ppt", label: "PPT" },
  { id: "table", label: "表格" },
  { id: "podcast", label: "播客" },
] as const

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
]

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0")
  const m = String((i % 4) * 15).padStart(2, "0")
  return `${h}:${m}`
})

function CreateScheduledTaskDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (task: Omit<ScheduledTask, "id" | "completed">) => void
}) {
  const [selectedAgent, setSelectedAgent] = useState("general")
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [time, setTime] = useState("09:00")
  const maxPromptLen = 2000

  const reset = () => {
    setSelectedAgent("general")
    setTitle("")
    setPrompt("")
    setFrequency("daily")
    setTime("09:00")
  }

  const handleConfirm = () => {
    if (!title.trim() || !prompt.trim()) return
    const now = new Date()
    onConfirm({
      title,
      scheduledAt: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${time}`,
      enabled: true,
    })
    reset()
    onOpenChange(false)
  }

  const handleClose = (v: boolean) => {
    if (!v) reset()
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>添加定时任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 智能体 */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">选择智能体</span>
            <div className="flex flex-wrap gap-2">
              {AGENT_OPTIONS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                    selectedAgent === agent.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {agent.label}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="ct-title">
              标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ct-title"
              placeholder="请输入标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 提示词 */}
          <div className="space-y-2">
            <Label htmlFor="ct-prompt">
              提示词 <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="ct-prompt"
                placeholder="请输入提示词"
                className="min-h-[120px] resize-none pb-8"
                value={prompt}
                maxLength={maxPromptLen}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <span className="text-muted-foreground absolute right-3 bottom-2 text-xs">
                {prompt.length} / {maxPromptLen}
              </span>
            </div>
          </div>

          {/* 开始时间 */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">开始时间</span>
            <div className="flex items-center gap-3">
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!title.trim() || !prompt.trim()}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScheduledTaskPanel() {
  const [tab, setTab] = useState<"scheduled" | "completed">("scheduled")
  const [tasks, setTasks] = useState<ScheduledTask[]>(mockScheduledTasks)
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = tasks.filter((t) =>
    tab === "scheduled" ? !t.completed : t.completed
  )

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const handleConfirm = (task: Omit<ScheduledTask, "id" | "completed">) => {
    setTasks((prev) => [{ ...task, id: Date.now().toString(), completed: false }, ...prev])
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border p-0.5">
          {(["scheduled", "completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1 text-sm transition-colors",
                tab === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "scheduled" ? "已定时" : "已完成"}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          新建定时计划
        </Button>
      </div>

      {/* Table header */}
      <div className="text-muted-foreground grid grid-cols-[1fr_180px_80px_40px] border-b pb-2 text-xs">
        <span>标题</span>
        <span>计划于</span>
        <span>状态</span>
        <span />
      </div>

      {/* Rows */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            暂无{tab === "scheduled" ? "定时" : "已完成"}任务
          </div>
        ) : (
          <div className="divide-border divide-y">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-[1fr_180px_80px_40px] items-center py-3"
              >
                <span className="text-sm font-medium">{task.title}</span>
                <span className="text-muted-foreground text-sm">{task.scheduledAt}</span>
                <Switch
                  checked={task.enabled}
                  onCheckedChange={() => handleToggle(task.id)}
                />
                <button className="text-muted-foreground hover:text-foreground flex justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <CreateScheduledTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

// ---------- settings panel ----------
const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
] as const

const THEME_OPTIONS = [
  { value: "system", label: "跟随系统", icon: Monitor },
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
] as const

function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<"zh" | "en">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("app_language") as "zh" | "en") ?? "zh"
    }
    return "zh"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (value: "zh" | "en") => {
    setLanguage(value)
    localStorage.setItem("app_language", value)
  }

  return (
    <div className="space-y-6">
      {/* Language */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Languages className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">语言</span>
        </div>
        <div className="flex gap-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleLanguageChange(opt.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm transition-colors",
                language === opt.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Theme */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">主题</span>
        </div>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
                mounted && theme === opt.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- main modal component ----------
interface AccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: string
}

export function AccountModal({
  open,
  onOpenChange,
  defaultTab = "account",
}: AccountModalProps) {
  const [activeKey, setActiveKey] = useState(defaultTab)
  // Sync active tab when the modal opens with a new defaultTab
  useEffect(() => {
    if (open) setActiveKey(defaultTab)
  }, [open, defaultTab])

  const activeNav = navItems.find((n) => n.key === activeKey) ?? navItems[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "bg-background fixed top-[50%] left-[50%] z-50 flex h-[600px] w-[860px] max-w-[calc(100vw-2rem)] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            账户设置
          </DialogPrimitive.Title>
          {/* Left sidebar */}
          <div className="bg-muted/30 flex w-[220px] shrink-0 flex-col border-r px-3 py-4">
            <p className="text-muted-foreground mb-3 px-2 text-xs font-medium uppercase tracking-wider">
              设置
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeKey === item.key
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right content */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">{activeNav.label}</h2>
              <DialogPrimitive.Close className="text-muted-foreground hover:text-foreground rounded-sm transition-colors">
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
              </DialogPrimitive.Close>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeKey === "account" && <AccountPanel />}
              {activeKey === "mcp" && <McpPanel />}
              {activeKey === "agent" && <AgentPanel />}
              {activeKey === "scheduled" && <ScheduledTaskPanel />}
              {activeKey === "settings" && <SettingsPanel />}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
