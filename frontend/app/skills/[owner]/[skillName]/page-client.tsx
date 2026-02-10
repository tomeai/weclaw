"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Copy,
  FileText,
  Folder,
  GitFork,
  Info,
  Link2,
  Star,
} from "lucide-react"
import { Play } from "@phosphor-icons/react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

// Mock data
const mockSkillDetail = {
  name: "skill-creator",
  owner: "anthropics",
  avatar: "",
  description:
    "Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.",
  category: "Productivity",
  favorite_count: 60429,
  repository: "anthropics/skills",
  install_command:
    "npx skills add https://smithery.ai/skills/anthropics/skill-creator",
  files: [
    { name: "references", type: "folder" as const },
    { name: "scripts", type: "folder" as const },
    { name: "SKILL.md", type: "file" as const, highlight: true },
    { name: "LICENSE.txt", type: "file" as const },
  ],
  content: `# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific domains or tasks—they transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge that no model can fully possess.

## When to activate

- User asks about creating a new skill
- User wants to update an existing skill
- User needs help with SKILL.md format

## Instructions

1. Understand the user's domain or task
2. Design the skill structure with appropriate sections
3. Write clear, actionable instructions
4. Include relevant scripts and references
5. Test the skill with representative queries`,
}

function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`
  }
  return count.toLocaleString()
}

export default function SkillDetailClient({
  owner,
  skillName,
}: {
  owner: string
  skillName: string
}) {
  const [copied, setCopied] = useState(false)
  const skill = { ...mockSkillDetail, owner, name: skillName }

  const handleCopy = () => {
    navigator.clipboard.writeText(skill.install_command)
    setCopied(true)
    toast.success("已复制到剪贴板")
    setTimeout(() => setCopied(false), 2000)
  }

  const avatarSeed = `${skill.owner}-${skill.name}`

  return (
    <div className="pt-app-header relative flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between border-b border-border/50 pb-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-1 ring-border/50">
              <AvatarImage
                src={
                  skill.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`
                }
                alt={skill.name}
              />
              <AvatarFallback className="text-sm font-medium">
                {skill.owner.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {skill.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {skill.owner}/{skill.name}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {skill.category}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Star className="h-3 w-3" />
                  {formatCount(skill.favorite_count)}
                </Badge>
              </div>
            </div>
          </div>
          <Link
            href={`/chat?type=skill&owner=${encodeURIComponent(owner)}&skill_name=${encodeURIComponent(skillName)}`}
          >
            <Button className="gap-2 whitespace-nowrap">
              <Play className="h-4 w-4" weight="fill" />
              Playground
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column */}
          <div className="min-w-0 flex-1">
            {/* About */}
            <section className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Info className="h-5 w-5" />
                About
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {skill.description}
              </p>
            </section>

            {/* SKILL.md */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <FileText className="h-5 w-5" />
                SKILL.md
              </h2>
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {skill.content.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) {
                      return (
                        <h2 key={i} className="mb-3 mt-0 text-xl font-bold">
                          {line.slice(2)}
                        </h2>
                      )
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <h3
                          key={i}
                          className="mb-2 mt-6 text-lg font-semibold"
                        >
                          {line.slice(3)}
                        </h3>
                      )
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <p key={i} className="my-1 pl-4 text-muted-foreground">
                          &bull; {line.slice(2)}
                        </p>
                      )
                    }
                    if (/^\d+\. /.test(line)) {
                      return (
                        <p key={i} className="my-1 pl-4 text-muted-foreground">
                          {line}
                        </p>
                      )
                    }
                    if (line.trim() === "") {
                      return <div key={i} className="h-2" />
                    }
                    return (
                      <p key={i} className="my-1 text-muted-foreground">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[340px]">
            {/* Install */}
            <section className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Link2 className="h-5 w-5" />
                Install
              </h2>

              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="mb-3 text-center text-sm text-muted-foreground">
                  Install via Skills CLI
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <code className="flex-1 truncate text-sm">
                    {skill.install_command}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 rounded p-1 transition-colors hover:bg-muted"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </section>

            {/* Repository */}
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Repository
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitFork className="h-4 w-4" />
                <span>{skill.repository}</span>
              </div>
            </section>

            {/* Files */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Folder className="h-4 w-4" />
                Files
              </h3>
              <div className="rounded-xl border border-border/50 bg-card">
                {skill.files.map((file, i) => (
                  <div
                    key={file.name}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                      i !== skill.files.length - 1
                        ? "border-b border-border/30"
                        : ""
                    }`}
                  >
                    <span className="text-muted-foreground/50">&mdash;</span>
                    {file.type === "folder" ? (
                      <>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {file.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={
                            file.highlight
                              ? "font-medium text-foreground underline underline-offset-2"
                              : "text-muted-foreground"
                          }
                        >
                          {file.name}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
