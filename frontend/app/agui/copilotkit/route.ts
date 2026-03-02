import { HttpAgent } from "@ag-ui/client";
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { API_ROUTE_AGENT_CHAT } from "@/lib/routes";

const BACKEND_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_ROUTE_AGENT_CHAT}`

export const POST = async (req: NextRequest) => {
  // 不需要手动设置 Authorization header
  // CopilotKit runtime 会自动从 request 提取 Authorization 并注入到 agent.headers

  // Forward selected MCPs and skills as query params to the backend
  const { searchParams } = req.nextUrl
  const params = new URLSearchParams()
  const mcps = searchParams.get("mcps")
  const skills = searchParams.get("skills")
  if (mcps) params.set("mcps", mcps)
  if (skills) params.set("skills", skills)
  const qs = params.toString()
  const backendUrl = qs ? `${BACKEND_BASE_URL}?${qs}` : BACKEND_BASE_URL

  const wemcpAgent = new HttpAgent({
    url: backendUrl,
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
