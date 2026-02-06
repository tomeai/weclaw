import ProfileLayout from "@/components/layout/profile-layout"
import { ProfileSidebar } from "@/components/sidebar/profile-sidebar"


export default function ProfilePage() {
  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
          <p className="text-muted-foreground">管理您的Mcp和Agent</p>
        </div>
      </div>
    </ProfileLayout>
  )
}
