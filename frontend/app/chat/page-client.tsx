"use client";

import { ChatBot } from "@/components/chat-bot";
import { COPILOT_AGENT_NAME, COPILOT_RUNTIME_URL } from "@/lib/copilotkit/config";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { useCallback, useRef, useState } from "react";
import { ChatSidebar, type ChatSidebarRef } from "./chat-sidebar";

type ChatClientProps = {
  type?: string
  owner?: string
  name?: string
}

export default function ChatClient({ type, owner, name }: ChatClientProps) {
  const [threadId, setThreadId] = useState<string | undefined>(undefined)
  const sidebarRef = useRef<ChatSidebarRef>(null)

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID()
    setThreadId(newId)
    sidebarRef.current?.addThread({ thread_id: newId, chat_title: "新对话" })
  }, [])

  const handleSelectThread = useCallback((id: string) => {
    setThreadId(id)
  }, [])

  return (
    <div className="flex h-full w-full">
      <ChatSidebar
        ref={sidebarRef}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CopilotKit
          key={threadId ?? "new"}
          runtimeUrl={COPILOT_RUNTIME_URL}
          agent={COPILOT_AGENT_NAME}
          threadId={threadId}
          showDevConsole={false}
          enableInspector={false}
          publicApiKey="self-hosted"
        >
          <ChatBot type={type} owner={owner} name={name} threadId={threadId} />
        </CopilotKit>
      </div>
    </div>
  )
}
