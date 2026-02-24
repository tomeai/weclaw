"use client"

import { useUser } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/lib/config"
import {
  emailLogin,
  getAuthMe,
  sendEmailCode,
  signInWithGithub,
  signInWithGoogle,
} from "@/lib/user"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type Step = "email" | "code"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useUser()

  const [isLoading, setIsLoading] = useState<"github" | "google" | "email" | "code" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<Step>("email")
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 倒计时逻辑
  const startCountdown = useCallback(() => {
    setCountdown(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function handleSignInWithGithub() {
    try {
      setIsLoading("github")
      setError(null)

      const data = await signInWithGithub()

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error("Error signing in with Github:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleSignInWithGoogle() {
    try {
      setIsLoading("google")
      setError(null)

      const data = await signInWithGoogle()

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error("Error signing in with Google:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleSendCode() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址")
      return
    }

    try {
      setIsLoading("email")
      setError(null)
      await sendEmailCode(email)
      toast.success("验证码已发送到您的邮箱")
      setStep("code")
      setCode("")
      startCountdown()
    } catch (err: any) {
      console.error("Error sending code:", err)
      setError(err.message || "发送验证码失败，请稍后重试")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleResendCode() {
    if (countdown > 0) return
    try {
      setIsLoading("email")
      setError(null)
      await sendEmailCode(email)
      toast.success("验证码已重新发送")
      startCountdown()
    } catch (err: any) {
      console.error("Error resending code:", err)
      setError(err.message || "发送验证码失败，请稍后重试")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleEmailLogin() {
    if (code.length !== 6) {
      setError("请输入6位验证码")
      return
    }

    try {
      setIsLoading("code")
      setError(null)
      const data = await emailLogin(email, code)

      // 存储 token
      if (data?.access_token) {
        localStorage.setItem("auth_token", data.access_token)
      }

      // 获取用户信息并更新上下文
      const userData = await getAuthMe()
      setUser({
        id: userData.id || userData.nickname || "",
        nickname: userData.nickname || "",
        avatar: userData.avatar || "",
        email: userData.email || "",
        daily_message_count: 0,
        is_staff: userData.is_staff ?? false,
        is_superuser: userData.is_superuser ?? false,
      })

      toast.success("登录成功")

      // 跳转
      const callbackUrl = searchParams.get("callbackUrl")
      router.push(callbackUrl || "/")
    } catch (err: any) {
      console.error("Error logging in:", err)
      setError(err.message || "登录失败，请检查验证码")
    } finally {
      setIsLoading(null)
    }
  }

  function handleBack() {
    setStep("email")
    setCode("")
    setError(null)
  }

  // 遮蔽邮箱中间部分
  function maskEmail(email: string) {
    const [local, domain] = email.split("@")
    if (local.length <= 2) return email
    return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Welcome to {APP_NAME}</h1>
          <p className="text-muted-foreground text-base">
            {step === "email"
              ? "Sign in below to increase your message limits."
              : `验证码已发送到 ${maskEmail(email)}`}
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
              {error}
            </div>
          )}

          {step === "email" ? (
            <>
              <Button
                variant="secondary"
                className="h-12 w-full text-base"
                size="lg"
                onClick={handleSignInWithGithub}
                disabled={isLoading !== null}
              >
                <img
                  src="https://www.github.com/favicon.ico"
                  alt="Github logo"
                  width={20}
                  height={20}
                  className="mr-2 size-4"
                />
                <span>{isLoading === "github" ? "Connecting..." : "Continue with Github"}</span>
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">或者</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Email Login */}
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="请输入您的电子邮件地址"
                  className="h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading !== null}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                />
                <Button
                  className="h-12 w-full text-base"
                  size="lg"
                  onClick={handleSendCode}
                  disabled={isLoading !== null}
                >
                  {isLoading === "email" ? "发送中..." : "继续"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* 验证码输入 */}
              <div className="space-y-3">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="请输入6位验证码"
                  className="h-12 text-center text-lg tracking-widest"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading !== null}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                  autoFocus
                />
                <Button
                  className="h-12 w-full text-base"
                  size="lg"
                  onClick={handleEmailLogin}
                  disabled={isLoading !== null || code.length !== 6}
                >
                  {isLoading === "code" ? "登录中..." : "登录"}
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading !== null}
                >
                  &larr; 返回
                </button>
                <button
                  onClick={handleResendCode}
                  className={`transition-colors ${
                    countdown > 0
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-primary hover:text-primary/80 cursor-pointer"
                  }`}
                  disabled={countdown > 0 || isLoading !== null}
                >
                  {countdown > 0 ? `重新发送 (${countdown}s)` : "重新发送验证码"}
                </button>
              </div>
            </>
          )}

          <div className="text-muted-foreground text-center text-xs leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-foreground hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-foreground hover:underline">
              Privacy Policy
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
