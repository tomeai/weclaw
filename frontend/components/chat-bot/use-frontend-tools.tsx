"use client"

import { useDefaultTool } from "@copilotkit/react-core"

/**
 * Register all frontend tools for the chat bot.
 * Call this hook once inside the CopilotKit provider.
 */
export function useFrontendTools() {
  // ----------------------------------
  // 🔧 Default Tool Rendering
  // Renders backend tool call status in the chat
  // ----------------------------------
  useDefaultTool({
    render: ({ name, status }) => {
      return (
        <p className="text-muted-foreground mt-2 text-sm">
          {status !== "complete" ? `正在调用 ${name}...` : `已调用 ${name}`}
        </p>
      )
    },
  })

  // ----------------------------------
  // 🪁 Frontend Tools
  // Add new useFrontendTool / useHumanInTheLoop calls below
  // ----------------------------------
}
