import LayoutApp from "@/components/layout/layout-app"
import { notFound } from "next/navigation"
import ServerDetailClient from "./page-client"

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ username: string; serverName: string }>
}) {
  const { username, serverName } = await params

  if (!serverName || !username) return notFound()

  return (
    <LayoutApp>
      <ServerDetailClient username={username} serverName={serverName} />
    </LayoutApp>
  )
}
