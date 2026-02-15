"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BarChart3, Bot, CircleDashed, Clock, Download, FileText, Globe, HelpCircle, ImageIcon, LayoutDashboard, MessageSquare, Mic, Presentation, Settings, SlidersHorizontal, Sparkles, SquarePen, Table2, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";


type TaskItem = {
  icon: LucideIcon
  title: string
}

const MOCK_TASKS: TaskItem[] = [
  { icon: CircleDashed, title: "2025年Q2季度营销策划方案" },
  { icon: Bot, title: "智能客服对话流程优化" },
  { icon: FileText, title: "产品需求文档撰写与评审" },
  { icon: BarChart3, title: "用户增长数据分析报告" },
  { icon: Globe, title: "官网SEO优化与内容更新" },
  { icon: MessageSquare, title: "社交媒体运营周报总结" },
  { icon: ImageIcon, title: "品牌视觉设计素材整理" },
  { icon: LayoutDashboard, title: "项目管理看板搭建" },
  { icon: FileText, title: "技术架构设计文档" },
  { icon: Bot, title: "AI助手功能测试用例" },
  { icon: BarChart3, title: "竞品分析与市场调研" },
  { icon: CircleDashed, title: "新员工入职培训计划" },
  { icon: Globe, title: "多语言国际化方案设计" },
  { icon: MessageSquare, title: "用户反馈收集与分类" },
  { icon: FileText, title: "技术架构设计文档" },
  { icon: Bot, title: "AI助手功能测试用例" },
  { icon: BarChart3, title: "竞品分析与市场调研" },
  { icon: CircleDashed, title: "新员工入职培训计划" },
  { icon: Globe, title: "多语言国际化方案设计" },
  { icon: MessageSquare, title: "用户反馈收集与分类" },
]

const TOP_ACTIONS = [
  { icon: SquarePen, label: "新建任务" },
  // { icon: Search, label: "搜索" },
  { icon: BarChart3, label: "资源库" },
] as const

const FOOTER_ACTIONS = [
  { icon: Settings, label: "设置" },
  { icon: Download, label: "下载" },
  { icon: Users, label: "社区" },
] as const

// ─── 智能体选项 ─────────────────────────────────────────────────────────────

const AGENT_OPTIONS = [
  { id: "general", label: "通用", icon: Sparkles },
  { id: "doc", label: "文档", icon: FileText },
  { id: "ppt", label: "PPT", icon: Presentation },
  { id: "table", label: "表格", icon: Table2 },
  { id: "podcast", label: "播客", icon: Mic },
] as const

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
]

// Generate time options (00:00 – 23:45, 15-min intervals)
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0")
  const m = String((i % 4) * 15).padStart(2, "0")
  return `${h}:${m}`
})

// ─── Scheduled Task Dialog ──────────────────────────────────────────────────

function ScheduledTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedAgent, setSelectedAgent] = useState("general")
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [time, setTime] = useState("09:00")

  const maxPromptLen = 2000

  const handleConfirm = () => {
    // TODO: submit scheduled task
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            添加定时任务
            <HelpCircle className="text-muted-foreground h-4 w-4" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 选择智能体 */}
          <div className="space-y-4">
            <span className="mb-2 block text-sm font-medium">选择智能体</span>
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
                  <agent.icon className="h-4 w-4" />
                  {agent.label}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-4">
            <label className="mb-2 block text-sm font-medium">
              标题 <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="请输入标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 提示词 */}
          <div className="space-y-4">
            <label className="mb-2 block text-sm font-medium">
              提示词 <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Textarea
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
          <div className="space-y-4">
            <span className="mb-2 block text-sm font-medium">开始时间</span>
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
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
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

// ─── ChatSidebar ────────────────────────────────────────────────────────────

export function ChatSidebar() {
  const [scheduledOpen, setScheduledOpen] = useState(false)

  return (
    <aside className="border-border flex h-full w-[260px] shrink-0 flex-col overflow-hidden border-r">
      {/* Top Actions */}
      <div className="space-y-1 px-4 pt-4">
        {TOP_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
          >
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </button>
        ))}
        <button
          onClick={() => setScheduledOpen(true)}
          className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
        >
          <Clock className="h-4 w-4" />
          <span>定时任务</span>
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-7 pt-6 pb-2">
        <span className="text-muted-foreground text-xs font-medium">
          所有任务
        </span>
      </div>

      {/* Task List */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-0.5 px-4 pb-4">
          {MOCK_TASKS.map((task, idx) => (
            <button
              key={idx}
              className={cn(
                "hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                idx === 0 && "bg-accent"
              )}
            >
              <task.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{task.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-border border-t px-4 py-3">
        <div className="flex items-center justify-around">
          {FOOTER_ACTIONS.map((action) => (
            <button
              key={action.label}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex flex-col items-center gap-1 rounded-lg px-3 py-1.5"
            >
              <action.icon className="h-4 w-4" />
              <span className="text-[11px]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Task Dialog */}
      <ScheduledTaskDialog
        open={scheduledOpen}
        onOpenChange={setScheduledOpen}
      />
    </aside>
  )
}
