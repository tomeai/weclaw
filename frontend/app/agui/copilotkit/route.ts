import { HttpAgent } from "@ag-ui/client";
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { API_ROUTE_AGENT_CHAT } from "@/lib/routes";

const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_ROUTE_AGENT_CHAT}`

export const POST = async (req: NextRequest) => {
  // 不需要手动设置 Authorization header
  // CopilotKit runtime 会自动从 request 提取 Authorization 并注入到 agent.headers
  const wemcpAgent = new HttpAgent({
    url: `${BACKEND_URL}`,
    description: "WeMCP Agent - AI assistant with MCP and skill integration",
  })

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/agui/copilotkit",
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
