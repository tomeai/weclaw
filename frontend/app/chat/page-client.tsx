"use client";

import { ChatBot } from "@/components/chat-bot";
import { COPILOT_AGENT_NAME, COPILOT_RUNTIME_URL } from "@/lib/copilotkit/config";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";


type ChatClientProps = {
  type?: string
  owner?: string
  name?: string
}

export default function ChatClient({ type, owner, name }: ChatClientProps) {
  return (
    <CopilotKit
      runtimeUrl={COPILOT_RUNTIME_URL}
      agent={COPILOT_AGENT_NAME}
      showDevConsole={false}
      enableInspector={false}
      publicApiKey="self-hosted"
    >
      <ChatBot type={type} owner={owner} name={name} />
    </CopilotKit>
  )
}
