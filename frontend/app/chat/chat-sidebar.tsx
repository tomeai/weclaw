"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import http from "@/lib/http"
import { useTitlePolling } from "@/hooks/use-title-polling";
import { cn } from "@/lib/utils";
import { AccountModal } from "@/components/user/account-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Download, FileText, HelpCircle, MessageSquare, Mic, Presentation, Settings, Sparkles, SquarePen, Table2, Users, type LucideIcon } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ThreadItem = {
  thread_id: string
  chat_title: string
}

type ChatSidebarProps = {
  activeThreadId?: string
  onSelectThread: (threadId: string) => void
  onNewChat: () => void
}


export type ChatSidebarRef = {
  addThread: (thread: ThreadItem) => void
}

// ─── Top / Footer actions ───────────────────────────────────────────────────

const COMMUNITY_QR_URL = "https://toolres.hprt.com/OnlineToolCenter/6156b3f0-161f-11f1-9c2a-c470bdc8eb5a/qrcode/2026-3-2/1772445953408_code.png"

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

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(
  function ChatSidebar({ activeThreadId, onSelectThread, onNewChat }, ref) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [accountModalTab, setAccountModalTab] = useState("settings")
  const [threads, setThreads] = useState<ThreadItem[]>([])
  const [loading, setLoading] = useState(true)

  const { startPolling } = useTitlePolling((threadId, title) => {
    setThreads((prev) =>
      prev.map((t) => (t.thread_id === threadId ? { ...t, chat_title: title } : t))
    )
  })

  useImperativeHandle(ref, () => ({
    addThread(thread: ThreadItem) {
      setThreads((prev) => {
        if (prev.some((t) => t.thread_id === thread.thread_id)) return prev
        return [thread, ...prev]
      })
      if (thread.chat_title === "新对话") {
        startPolling(thread.thread_id)
      }
    },
  }), [startPolling])

  // Fetch thread list
  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true)
      const data = await http.get<ThreadItem[]>("/api/v1/agent/threads")
      setThreads(data)
    } catch {
      // http interceptor already shows toast
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return (
    <aside className="border-border flex h-full w-[260px] shrink-0 flex-col overflow-hidden border-r">
      {/* Top Actions */}
      <div className="space-y-1 px-4 pt-4">
        <button
          onClick={onNewChat}
          className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
        >
          <SquarePen className="h-4 w-4" />
          <span>新建对话</span>
        </button>
        {/*<button*/}
        {/*  className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm"*/}
        {/*>*/}
        {/*  <BarChart3 className="h-4 w-4" />*/}
        {/*  <span>资源库</span>*/}
        {/*</button>*/}
        <button
          onClick={() => { setAccountModalTab("scheduled"); setSettingsOpen(true) }}
          className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
        >
          <Clock className="h-4 w-4" />
          <span>定时任务</span>
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-7 pt-6 pb-2">
        <span className="text-muted-foreground text-xs font-medium">
          所有对话
        </span>
      </div>

      {/* Thread List */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-0.5 px-4 pb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="border-muted-foreground h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : threads.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              暂无对话记录
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.thread_id}
                onClick={() => onSelectThread(thread.thread_id)}
                className={cn(
                  "hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                  activeThreadId === thread.thread_id && "bg-accent"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{thread.chat_title}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-border border-t px-4 py-3">
        <div className="flex items-center justify-around">
          {/* 设置 */}
          <button
            onClick={() => { setAccountModalTab("settings"); setSettingsOpen(true) }}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex flex-col items-center gap-1 rounded-lg px-3 py-1.5"
          >
            <Settings className="h-4 w-4" />
            <span className="text-[11px]">设置</span>
          </button>

          {/* 下载 */}
          <a
            href="https://wiwi.chat/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex flex-col items-center gap-1 rounded-lg px-3 py-1.5"
          >
            <Download className="h-4 w-4" />
            <span className="text-[11px]">下载</span>
          </a>

          {/* 社群 - hover 显示二维码 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:bg-accent hover:text-foreground flex flex-col items-center gap-1 rounded-lg px-3 py-1.5">
                <Users className="h-4 w-4" />
                <span className="text-[11px]">社群</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-background border border-border p-1.5 shadow-lg">
              <img
                src={COMMUNITY_QR_URL}
                alt="社群二维码"
                className="w-32 h-32 rounded"
              />
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Account / Settings Modal */}
      <AccountModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={accountModalTab}
      />
    </aside>
  )
})
