"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthMe } from "@/app/lib/api"
import { useUser } from "@/app/providers/user-provider"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 获取URL参数中的access_token
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get("access_token")

        if (!accessToken) {
          throw new Error("No access token found in callback URL")
        }

        // 将access_token存储到localStorage
        localStorage.setItem("auth_token", accessToken)

        // 获取用户信息
        const userData = await getAuthMe()
        console.log("User data from auth/me:", userData)

        if (userData.code === 200 && userData.data) {
          // 更新用户状态
          setUser({
            id: userData.data.id || userData.data.nickname || "",
            nickname: userData.data.nickname || "",
            avatar: userData.data.avatar || "",
            email: userData.data.email || "",
            daily_message_count: 0,
          })

          setStatus("success")
          
          // 延迟跳转，让用户看到成功状态
          setTimeout(() => {
            router.push("/")
          }, 1500)
        } else {
          throw new Error(userData.msg || "Failed to get user information")
        }
      } catch (err: any) {
        console.error("Auth callback error:", err)
        setError(err.message || "Authentication failed")
        setStatus("error")
        
        // 清除无效的token
        localStorage.removeItem("auth_token")
        
        // 延迟跳转到登录页
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    }

    handleCallback()
  }, [router, setUser])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                正在完成登录...
              </h2>
              <p className="text-gray-600">
                请稍候，我们正在验证您的身份信息
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                登录成功！
              </h2>
              <p className="text-gray-600">
                正在跳转到首页...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                登录失败
              </h2>
              <p className="mb-4 text-gray-600">
                {error || "认证过程中发生错误"}
              </p>
              <p className="text-sm text-gray-500">
                将在3秒后跳转到首页...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
