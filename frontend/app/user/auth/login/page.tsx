"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/lib/config"
import { signInWithGithub, signInWithGoogle } from "@/lib/user"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<"github" | "google" | "email" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")

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

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Welcome to {APP_NAME}</h1>
          <p className="text-muted-foreground text-base">
            Sign in below to increase your message limits.
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
              {error}
            </div>
          )}

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

          <Button
            variant="secondary"
            className="h-12 w-full text-base"
            size="lg"
            onClick={handleSignInWithGoogle}
            disabled={isLoading !== null}
          >
            <svg className="mr-2 size-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{isLoading === "google" ? "Connecting..." : "Continue with Google"}</span>
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
            />
            <Button
              className="h-12 w-full text-base"
              size="lg"
              onClick={() => toast.info("敬请期待")}
              disabled={isLoading !== null}
            >
              继续
            </Button>
          </div>

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

          {/* Brand */}
          {/*<div className="flex flex-col items-center gap-1 pt-2">*/}
          {/*  <span className="text-xs text-muted-foreground/60">from</span>*/}
          {/*  <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">*/}
          {/*    /!*<svg className="h-6 w-6" viewBox="0 0 28 28">*!/*/}
          {/*    /!*  <g transform="translate(3, 22) scale(1, -1)">*!/*/}
          {/*    /!*    <rect x="0" y="-12" width="3" height="12" fill="currentColor" rx="2" />*!/*/}
          {/*    /!*    <rect x="5" y="-20" width="3" height="20" fill="currentColor" rx="2" />*!/*/}
          {/*    /!*    <rect x="10" y="-16" width="3" height="16" fill="currentColor" rx="2" />*!/*/}
          {/*    /!*    <rect x="15" y="-8" width="3" height="8" fill="currentColor" rx="2" />*!/*/}
          {/*    /!*  </g>*!/*/}
          {/*    /!*</svg>*!/*/}
          {/*    <span className="text-lg font-semibold text-foreground">OpenTome</span>*/}
          {/*  </Link>*/}
          {/*</div>*/}

          <div className="text-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
