import { HttpAgent } from "@ag-ui/client";
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { NextRequest } from "next/server";


const BACKEND_URL = "http://127.0.0.1:8000/api/v1/agent/chat"
// const BACKEND_URL = "http://127.0.0.1:8090/ag-ui"

export const POST = async (req: NextRequest) => {
  // Create the HttpAgent for the wemcp_agent
  const wemcpAgent = new HttpAgent({
    url: `${BACKEND_URL}`,
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
