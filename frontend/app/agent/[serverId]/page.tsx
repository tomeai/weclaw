import { notFound } from "next/navigation"
import ServerDetailClient from "./page-client"
import LayoutApp from "@/components/layout/layout-app"

export default async function ServerDetailPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  if (!serverId) return notFound()

  return (
    <LayoutApp>
      <ServerDetailClient serverId={serverId} />
    </LayoutApp>
  )
}
