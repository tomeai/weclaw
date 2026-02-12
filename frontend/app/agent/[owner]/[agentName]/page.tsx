import { notFound } from "next/navigation"
import AgentDetailClient from "./page-client"
import LayoutApp from "@/components/layout/layout-app"

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ owner: string; agentName: string }>
}) {
  const { owner, agentName } = await params

  if (!owner || !agentName) return notFound()

  return (
    <LayoutApp>
      <AgentDetailClient owner={owner} agentName={agentName} />
    </LayoutApp>
  )
}
