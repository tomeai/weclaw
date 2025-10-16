import LayoutApp from "@/app/components/layout/layout-app"
import { notFound } from "next/navigation"
import ServerDetailClient from "./page-client"

export default async function ServerDetailPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  if (!serverId) return notFound()

  return (
    <LayoutApp>
      <ServerDetailClient serverId={serverId} />
    </LayoutApp>
  )
}
