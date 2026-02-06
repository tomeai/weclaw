"use client"

import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"
import { signInWithGithub } from "@/lib/user"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignInWithGithub() {
    try {
      setIsLoading(true)
      setError(null)

      const data = await signInWithGithub()

      // Redirect to the provider URL
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error("Error signing in with Github:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
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
            disabled={isLoading}
          >
            <img
              src="https://www.github.com/favicon.ico"
              alt="Github logo"
              width={20}
              height={20}
              className="mr-2 size-4"
            />
            <span>{isLoading ? "Connecting..." : "Continue with Github"}</span>
          </Button>

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
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
