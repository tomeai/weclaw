"use client"

import { signInWithGithub } from "@/app/lib/api"
import { APP_NAME } from "@/app/lib/config"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Welcome to {APP_NAME}</DialogTitle>
          <DialogDescription className="text-base">
            Sign in below to increase your message limits.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            variant="secondary"
            className="w-full text-base h-12"
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
            <span>
              {isLoading ? "Connecting..." : "Continue with Github"}
            </span>
          </Button>
          
          <div className="text-center text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="/" className="text-foreground hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/" className="text-foreground hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
