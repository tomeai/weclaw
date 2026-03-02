"use client";

import { ChatBot } from "@/components/chat-bot";
import type { SelectedContext } from "@/components/chat-bot/types";
import { COPILOT_AGENT_NAME } from "@/lib/copilotkit/config";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatSidebar, type ChatSidebarRef } from "./chat-sidebar";

const COPILOT_BASE_URL = "/agui/copilotkit"

type ChatClientProps = {
  type?: string
  owner?: string
  name?: string
}

export default function ChatClient({ type, owner, name }: ChatClientProps) {
  const [threadId, setThreadId] = useState<string | undefined>(() => crypto.randomUUID())
  const sidebarRef = useRef<ChatSidebarRef>(null)
  const addedToSidebarRef = useRef<Set<string>>(new Set())

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID()
    setThreadId(newId)
    // 不立即加入侧边栏，等发送第一条消息后再显示
  }, [])

  const handleSelectThread = useCallback((id: string) => {
    setThreadId(id)
  }, [])

  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({})
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      setAuthHeaders({ Authorization: `Bearer ${token}` })
    }
    setAuthReady(true)
  }, [])

  // Selected MCPs and skills (lifted here to build dynamic runtimeUrl)
  const [selectedMcps, setSelectedMcps] = useState<SelectedContext[]>(() => {
    if (type === "mcp" && owner && name) {
      return [{ type: "mcp", owner, name, label: name }]
    }
    return []
  })
  const [selectedSkills, setSelectedSkills] = useState<SelectedContext[]>(() => {
    if (type === "skill" && owner && name) {
      return [{ type: "skill", owner, name, label: name }]
    }
    return []
  })

  const onToggleMcp = useCallback((ctx: SelectedContext) => {
    setSelectedMcps((prev) => {
      const exists = prev.some((s) => s.owner === ctx.owner && s.name === ctx.name)
      return exists
        ? prev.filter((s) => !(s.owner === ctx.owner && s.name === ctx.name))
        : [...prev, ctx]
    })
  }, [])

  const onToggleSkill = useCallback((ctx: SelectedContext) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => s.owner === ctx.owner && s.name === ctx.name)
      return exists
        ? prev.filter((s) => !(s.owner === ctx.owner && s.name === ctx.name))
        : [...prev, ctx]
    })
  }, [])

  const onRemoveMcp = useCallback((ctx: SelectedContext) => {
    setSelectedMcps((prev) =>
      prev.filter((s) => !(s.owner === ctx.owner && s.name === ctx.name))
    )
  }, [])

  const onRemoveSkill = useCallback((ctx: SelectedContext) => {
    setSelectedSkills((prev) =>
      prev.filter((s) => !(s.owner === ctx.owner && s.name === ctx.name))
    )
  }, [])

  // Build runtime URL with selected MCPs and skills as query params
  const runtimeUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedMcps.length > 0) {
      params.set("mcps", selectedMcps.map((m) => `${m.owner}/${m.name}`).join(","))
    }
    if (selectedSkills.length > 0) {
      params.set("skills", selectedSkills.map((s) => `${s.owner}/${s.name}`).join(","))
    }
    const qs = params.toString()
    return qs ? `${COPILOT_BASE_URL}?${qs}` : COPILOT_BASE_URL
  }, [selectedMcps, selectedSkills])

  // 首次发消息时，将当前 thread 添加到 sidebar
  const handleSendMessage = useCallback(() => {
    if (threadId && !addedToSidebarRef.current.has(threadId)) {
      sidebarRef.current?.addThread({ thread_id: threadId, chat_title: "新对话" })
      addedToSidebarRef.current.add(threadId)
    }
  }, [threadId])

  return (
    <div className="flex h-full w-full">
      <ChatSidebar
        ref={sidebarRef}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {authReady ? (
          <CopilotKit
            key={threadId ?? "new"}
            runtimeUrl={runtimeUrl}
            agent={COPILOT_AGENT_NAME}
            threadId={threadId}
            showDevConsole={false}
            enableInspector={false}
            publicApiKey="self-hosted"
            headers={authHeaders}
          >
            <ChatBot
              type={type}
              owner={owner}
              name={name}
              threadId={threadId}
              onSendMessage={handleSendMessage}
              selectedMcps={selectedMcps}
              selectedSkills={selectedSkills}
              onToggleMcp={onToggleMcp}
              onToggleSkill={onToggleSkill}
              onRemoveMcp={onRemoveMcp}
              onRemoveSkill={onRemoveSkill}
            />
          </CopilotKit>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          </div>
        )}
      </div>
    </div>
  )
}
