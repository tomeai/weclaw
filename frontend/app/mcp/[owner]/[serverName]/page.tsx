import LayoutApp from "@/components/layout/layout-app"
import { notFound } from "next/navigation"
import ServerDetailClient from "./page-client"

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ owner: string; serverName: string }>
}) {
  const { owner, serverName } = await params

  if (!serverName || !owner) return notFound()

  return (
    <LayoutApp>
      <ServerDetailClient owner={owner} serverName={serverName} />
    </LayoutApp>
  )
}
