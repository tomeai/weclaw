"use client"

import type { SelectedContext } from "./types"
import { CustomInput } from "./custom-input"
import { cn } from "@/lib/utils"
import { CopilotChat } from "@copilotkit/react-ui"
import { useCallback, useState } from "react"

type ChatBotProps = {
  type?: string
  owner?: string
  name?: string
}

export function ChatBot({ type, owner, name }: ChatBotProps) {
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
    ]
  )

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <CopilotChat
        className="flex-1"
        instructions={buildInstructions()}
        labels={{
          title: "AI 助手",
          initial: "你好！我可以帮你完成各种任务，请问有什么需要帮助的？",
          placeholder: "输入 @ 选择Agent，分配任务或提问",
        }}
        Input={InputWithToolbar}
      />
    </div>
  )
}
