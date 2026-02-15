import { CopilotRuntime, ExperimentalEmptyAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime"
import { HttpAgent } from "@ag-ui/client"
import { NextRequest } from "next/server"

const BACKEND_URL = "http://localhost:8090"

export const POST = async (req: NextRequest) => {
  // Create the HttpAgent for the wemcp_agent
  const wemcpAgent = new HttpAgent({
    url: `${BACKEND_URL}/ag-ui`,
    description: "WeMCP Agent - AI assistant with MCP and skill integration",
  })

  // Create CopilotRuntime with agents
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    serviceAdapter: new ExperimentalEmptyAdapter(),
    runtime: new CopilotRuntime({
      agents: {
        wemcp_agent: wemcpAgent,
      },
    }),
  })

  return handleRequest(req)
}

export const GET = POST
