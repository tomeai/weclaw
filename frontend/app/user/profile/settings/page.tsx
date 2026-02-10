"use client"

import ProfileLayout from "@/components/layout/profile-layout"
import { ProfileSidebar } from "@/components/sidebar/profile-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Mail, Save, Upload, User } from "lucide-react"
import { useState } from "react"

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: "张三",
    email: "zhangsan@example.com",
    phone: "13800138000",
    bio: "热爱技术的开发者，专注于AI和云计算领域。",
    location: "北京",
    website: "https://zhangsan.dev",
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    // 模拟保存操作
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">账户设置</h1>
          <p className="text-muted-foreground">管理您的个人信息和偏好设置</p>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>更新您的个人资料信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 头像上传 */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-avatar.jpg" alt="用户头像" />
                <AvatarFallback>张三</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  更换头像
                </Button>
                <p className="text-muted-foreground mt-1 text-xs">
                  支持 JPG、PNG 格式，最大 2MB
                </p>
              </div>
            </div>

            {/* 表单字段 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) =>
                    handleInputChange("nickname", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                placeholder="介绍一下您自己..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        {/*<Card>*/}
        {/*  <CardHeader>*/}
        {/*    <CardTitle className="flex items-center">*/}
        {/*      <Mail className="mr-2 h-5 w-5" />*/}
        {/*      通知设置*/}
        {/*    </CardTitle>*/}
        {/*    <CardDescription>管理您的通知偏好</CardDescription>*/}
        {/*  </CardHeader>*/}
        {/*  <CardContent className="space-y-4">*/}
        {/*    <div className="flex items-center justify-between">*/}
        {/*      <div className="space-y-0.5">*/}
        {/*        <Label>邮件通知</Label>*/}
        {/*        <p className="text-muted-foreground text-sm">*/}
        {/*          接收重要更新和消息的邮件通知*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*      <Switch*/}
        {/*        checked={formData.emailNotifications}*/}
        {/*        onCheckedChange={(checked: boolean) =>*/}
        {/*          handleInputChange("emailNotifications", checked)*/}
        {/*        }*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-between">*/}
        {/*      <div className="space-y-0.5">*/}
        {/*        <Label>推送通知</Label>*/}
        {/*        <p className="text-muted-foreground text-sm">*/}
        {/*          在浏览器中接收实时推送通知*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*      <Switch*/}
        {/*        checked={formData.pushNotifications}*/}
        {/*        onCheckedChange={(checked: boolean) =>*/}
        {/*          handleInputChange("pushNotifications", checked)*/}
        {/*        }*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </CardContent>*/}
        {/*</Card>*/}

        {/* 隐私设置 */}
        {/*<Card>*/}
        {/*  <CardHeader>*/}
        {/*    <CardTitle className="flex items-center">*/}
        {/*      <Globe className="mr-2 h-5 w-5" />*/}
        {/*      隐私设置*/}
        {/*    </CardTitle>*/}
        {/*    <CardDescription>控制您的信息可见性</CardDescription>*/}
        {/*  </CardHeader>*/}
        {/*  <CardContent className="space-y-4">*/}
        {/*    <div className="flex items-center justify-between">*/}
        {/*      <div className="space-y-0.5">*/}
        {/*        <Label>公开资料</Label>*/}
        {/*        <p className="text-muted-foreground text-sm">*/}
        {/*          允许其他用户查看您的基本资料信息*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*      <Switch*/}
        {/*        checked={formData.publicProfile}*/}
        {/*        onCheckedChange={(checked: boolean) =>*/}
        {/*          handleInputChange("publicProfile", checked)*/}
        {/*        }*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </CardContent>*/}
        {/*</Card>*/}

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "保存中..." : "保存更改"}
          </Button>
        </div>
      </div>
    </ProfileLayout>
  )
}
