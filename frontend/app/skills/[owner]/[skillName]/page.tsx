import LayoutApp from "@/components/layout/layout-app"
import { notFound } from "next/navigation"
import SkillDetailClient from "./page-client"

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ owner: string; skillName: string }>
}) {
  const { owner, skillName } = await params

  if (!owner || !skillName) return notFound()

  return (
    <LayoutApp>
      <SkillDetailClient owner={owner} skillName={skillName} />
    </LayoutApp>
  )
}
