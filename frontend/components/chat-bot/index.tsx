"use client"

import type { SelectedContext } from "./types"
import { CustomInput } from "./custom-input"
import { useFrontendTools } from "./use-frontend-tools"
import { CopilotChat } from "@copilotkit/react-ui"
import { useCopilotChatInternal } from "@copilotkit/react-core"
import http from "@/lib/http"
import { useCallback, useEffect, useRef, useState } from "react"

type ChatBotProps = {
  type?: string
  owner?: string
  name?: string
  threadId?: string
  onSendMessage?: () => void
}

type ThreadMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatBot({ type, owner, name, threadId, onSendMessage }: ChatBotProps) {
  const { setMessages } = useCopilotChatInternal()
  const setMessagesRef = useRef(setMessages)
  setMessagesRef.current = setMessages

  // Load history messages when threadId is set
  useEffect(() => {
    if (!threadId) return
    let cancelled = false
    ;(async () => {
      try {
        const messages = await http.get<ThreadMessage[]>(
          `/api/v1/agent/threads/${threadId}/messages`
        )
        if (cancelled) return
        if (messages?.length) {
          setMessagesRef.current(
            messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))
          )
        }
      } catch {
        // http interceptor already shows toast
      }
    })()
    return () => { cancelled = true }
  }, [threadId])
  // Initialize selected contexts from props
  const [selectedAgent, setSelectedAgent] = useState<SelectedContext | null>(
    () => {
      if (type === "agent" && owner && name) {
        return { type: "agent", owner, name, label: name }
      }
      return null
    }
  )
  const [selectedMcps, setSelectedMcps] = useState<SelectedContext[]>(() => {
    if (type === "mcp" && owner && name) {
      return [{ type: "mcp", owner, name, label: name }]
    }
    return []
  })
  const [selectedSkills, setSelectedSkills] = useState<SelectedContext[]>(
    () => {
      if (type === "skill" && owner && name) {
        return [{ type: "skill", owner, name, label: name }]
      }
      return []
    }
  )
  const [mcpOpen, setMcpOpen] = useState(false)
  const [skillOpen, setSkillOpen] = useState(false)

  // Register all frontend tools
  useFrontendTools()

  const onToggleMcp = useCallback((ctx: SelectedContext) => {
    setSelectedMcps((prev) => {
      const exists = prev.some(
        (s) => s.owner === ctx.owner && s.name === ctx.name
      )
      return exists
        ? prev.filter((s) => !(s.owner === ctx.owner && s.name === ctx.name))
        : [...prev, ctx]
    })
  }, [])

  const onToggleSkill = useCallback((ctx: SelectedContext) => {
    setSelectedSkills((prev) => {
      const exists = prev.some(
        (s) => s.owner === ctx.owner && s.name === ctx.name
      )
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

  // Build system instructions from selected context
  const buildInstructions = useCallback(() => {
    const parts: string[] = []

    if (selectedAgent) {
      parts.push(
        `Use agent: ${selectedAgent.owner}/${selectedAgent.name}`
      )
    }

    if (selectedMcps.length > 0) {
      const mcpList = selectedMcps
        .map((m) => `${m.owner}/${m.name}`)
        .join(", ")
      parts.push(`Use MCP servers: ${mcpList}`)
    }

    if (selectedSkills.length > 0) {
      const skillList = selectedSkills
        .map((s) => `${s.owner}/${s.name}`)
        .join(", ")
      parts.push(`Use skills: ${skillList}`)
    }

    return parts.length > 0 ? parts.join("\n") : undefined
  }, [selectedAgent, selectedMcps, selectedSkills])

  // Custom Input component that includes MCP/Skill/Agent toolbar
  const InputWithToolbar = useCallback(
    (props: { inProgress: boolean; onSend: (text: string) => void; onStop?: () => void; chatReady?: boolean }) => (
      <CustomInput
        {...props}
        onSend={(text: string) => {
          onSendMessage?.()
          props.onSend(text)
        }}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        selectedMcps={selectedMcps}
        selectedSkills={selectedSkills}
        onToggleMcp={onToggleMcp}
        onToggleSkill={onToggleSkill}
        onRemoveMcp={onRemoveMcp}
        onRemoveSkill={onRemoveSkill}
        mcpOpen={mcpOpen}
        setMcpOpen={setMcpOpen}
        skillOpen={skillOpen}
        setSkillOpen={setSkillOpen}
      />
    ),
    [
      selectedAgent,
      selectedMcps,
      selectedSkills,
      onToggleMcp,
      onToggleSkill,
      onRemoveMcp,
      onRemoveSkill,
      mcpOpen,
      skillOpen,
      onSendMessage,
    ]
  )

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <CopilotChat
        className="flex-1"
        instructions={buildInstructions()}
        labels={{
          title: "AI 助手",
          // initial: "你好！我可以帮你完成各种任务，请问有什么需要帮助的？",
          placeholder: "输入 @ 选择Agent，分配任务或提问",
        }}
        Input={InputWithToolbar}
      />
    </div>
  )
}
