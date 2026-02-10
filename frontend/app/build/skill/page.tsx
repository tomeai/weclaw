"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LayoutApp from "@/components/layout/layout-app"
import { publishSkill } from "@/lib/skill"
import { Eye, FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function BuildSkillPage() {
  const [namespace, setNamespace] = useState("")
  const [slug, setSlug] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handlePublish = async () => {
    if (!namespace.trim()) {
      toast.error("请输入 Namespace")
      return
    }
    if (!slug.trim()) {
      toast.error("请输入 Slug")
      return
    }
    if (!githubUrl.trim()) {
      toast.error("请输入 GitHub URL")
      return
    }

    setIsSubmitting(true)
    try {
      await publishSkill({
        namespace: namespace.trim(),
        slug: slug.trim(),
        github_url: githubUrl.trim(),
      })
      toast.success("Skill 发布成功，正在审核中")
      setTimeout(() => {
        window.location.href = "/skills"
      }, 2000)
    } catch (error: any) {
      console.error("发布失败:", error)
      toast.error(error.message || "发布失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LayoutApp>
      <div className="pt-app-header relative flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left: Form */}
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Import Skill
              </h1>
              <p className="mb-8 text-muted-foreground">
                Link a skill from GitHub to make it available on the platform.
              </p>

              <div className="rounded-xl border border-border/50 bg-card p-6">
                {/* Namespace / Slug */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Namespace * / Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={namespace}
                      onChange={(e) =>
                        setNamespace(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      placeholder="my-namespace"
                      className="flex-1 font-mono"
                    />
                    <span className="text-lg text-muted-foreground">/</span>
                    <Input
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      placeholder="slug"
                      className="flex-1 font-mono"
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Great namespace and slugs are short and memorable.
                  </p>
                </div>

                {/* GitHub URL */}
                <div className="mb-8">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    GitHub URL *
                  </label>
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/.../path/to/skill"
                    className="font-mono"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Link to the folder containing your SKILL.md file
                  </p>
                </div>

                {/* Publish Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: SKILL.md Reference */}
            <div className="w-full lg:w-[480px]">
              <div className="rounded-xl border border-border/50 bg-card">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <FileText className="h-5 w-5" />
                    <span className="text-lg font-semibold">SKILL.md</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                </div>

                {/* Content */}
                <div className="p-5">
                  {showPreview ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <h3>foo-bar</h3>
                      <p>Does foo and bar for the user.</p>
                      <h4>When to activate</h4>
                      <ul>
                        <li>User asks about foo or bar</li>
                        <li>User needs help with baz</li>
                      </ul>
                      <h4>Instructions</h4>
                      <ol>
                        <li>First, do foo</li>
                        <li>Then apply bar</li>
                        <li>Return baz as the result</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="space-y-4 font-mono text-sm leading-relaxed">
                      {/* YAML Frontmatter */}
                      <div>
                        <p className="mb-2 font-sans text-xs text-muted-foreground">
                          YAML Frontmatter (required)
                        </p>
                        <div className="rounded-lg bg-muted/50 p-4">
                          <p className="text-muted-foreground">---</p>
                          <p>
                            <span className="text-orange-500">name:</span>{" "}
                            foo-bar{" "}
                            <span className="text-muted-foreground">
                              &larr; lowercase, hyphens only, max 64 chars
                            </span>
                          </p>
                          <p>
                            <span className="text-orange-500">description:</span>{" "}
                            Does foo and bar for the user.{" "}
                            <span className="text-muted-foreground">
                              &larr; max 1024 chars
                            </span>
                          </p>
                          <p className="mt-3 text-muted-foreground">
                            # Optional fields
                          </p>
                          <p>license: MIT</p>
                          <p>metadata:</p>
                          <p className="pl-4">author: your-org</p>
                          <p className="text-muted-foreground">---</p>
                        </div>
                      </div>

                      {/* Markdown Body */}
                      <div>
                        <p className="mb-2 font-sans text-xs text-muted-foreground">
                          Markdown Body (skill instructions)
                        </p>
                        <div className="rounded-lg bg-muted/50 p-4">
                          <p>
                            You are an expert at foo. Help users with bar tasks.
                          </p>
                          <p className="mt-3 font-semibold">
                            ## When to activate
                          </p>
                          <p>- User asks about foo or bar</p>
                          <p>- User needs help with baz</p>
                          <p className="mt-3 font-semibold">## Instructions</p>
                          <p>1. First, do foo</p>
                          <p>2. Then apply bar</p>
                          <p>3. Return baz as the result</p>
                        </div>
                      </div>

                      {/* Optional directories */}
                      <div className="border-t border-border/50 pt-4">
                        <p className="mb-1 font-sans text-xs text-muted-foreground">
                          Optional directories:
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-semibold">
                            scripts/
                          </span>{" "}
                          &mdash; executable code agents can run
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-semibold">
                            references/
                          </span>{" "}
                          &mdash; additional docs loaded on demand
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutApp>
  )
}
