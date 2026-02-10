"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Play } from "@phosphor-icons/react"
import {
  BookOpen,
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Database,
  MessageSquare,
  Settings,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data
const mockAgentDetail = {
  title: "AI 研究助理",
  owner: "anthropics",
  avatar: "",
  description:
    "一个专业的 AI 研究助理，能够帮助你搜索学术论文、总结研究成果、分析数据趋势，并生成结构化的研究报告。支持多种学科领域，包括计算机科学、生物学、物理学等。",
  category: "研究",
  tools: 8,
  skills: 5,
  knowledge: 3,
  databases: 2,
  system_prompt:
    "你是一个专业的 AI 研究助理。你的目标是帮助用户完成学术研究相关的任务，包括文献搜索、论文总结、数据分析和报告撰写。你应该始终提供准确、有据可查的信息，并在不确定时明确说明。",
  tool_list: [
    { name: "arxiv_search", description: "搜索 arXiv 上的学术论文" },
    { name: "paper_summarizer", description: "总结学术论文的核心观点" },
    { name: "data_analyzer", description: "分析和可视化研究数据" },
    { name: "citation_generator", description: "生成标准格式的引用" },
  ],
  skill_list: [
    { name: "literature-review", description: "系统性文献综述" },
    { name: "research-methodology", description: "研究方法论指导" },
    { name: "academic-writing", description: "学术写作辅助" },
  ],
  chat_demo: [
    {
      role: "user" as const,
      content: "帮我搜索最近关于大语言模型推理能力的论文",
    },
    {
      role: "assistant" as const,
      content:
        "好的，我来为你搜索最近关于大语言模型推理能力的研究论文。我将使用 arXiv 搜索工具来查找相关文献...\n\n找到以下 5 篇高度相关的论文：\n\n1. **Chain-of-Thought Prompting Elicits Reasoning in Large Language Models** - 提出了链式思维提示方法\n2. **Tree of Thoughts: Deliberate Problem Solving with LLMs** - 探索了树状思维结构\n3. **Self-Consistency Improves Chain of Thought Reasoning** - 改进了推理一致性",
    },
    {
      role: "user" as const,
      content: "帮我总结第一篇论文的核心观点",
    },
    {
      role: "assistant" as const,
      content:
        "**Chain-of-Thought Prompting Elicits Reasoning in Large Language Models**\n\n核心观点：\n- 通过在提示中加入中间推理步骤，可以显著提升大模型在复杂推理任务上的表现\n- 该方法在算术推理、常识推理和符号推理三类任务上都取得了显著提升\n- 模型规模越大，链式思维的效果越明显",
    },
  ],
}

export default function AgentDetailClient({
  serverId,
}: {
  serverId: string
}) {
  const [descExpanded, setDescExpanded] = useState(false)
  const agent = { ...mockAgentDetail }

  const avatarSeed = `${agent.owner}-${agent.title}`

  return (
    <div className="pt-app-header relative flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 border-b border-border/50 pb-8">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Info */}
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <Avatar className="h-14 w-14 flex-shrink-0 rounded-xl ring-1 ring-border/50">
                <AvatarImage
                  src={
                    agent.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`
                  }
                  alt={agent.title}
                />
                <AvatarFallback className="rounded-xl text-sm font-medium">
                  {agent.title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="truncate text-2xl font-bold text-foreground">
                    {agent.title}
                  </h1>
                  <span className="text-sm text-muted-foreground">
                    by {agent.owner}
                  </span>
                </div>
                <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {agent.description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <BrainCircuit className="h-3 w-3" />
                    {agent.category}
                  </Badge>
                  {agent.tools > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Wrench className="h-3 w-3" />
                      {agent.tools} tools
                    </Badge>
                  )}
                  {agent.skills > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Zap className="h-3 w-3" />
                      {agent.skills} skills
                    </Badge>
                  )}
                  {agent.knowledge > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <BookOpen className="h-3 w-3" />
                      {agent.knowledge} 知识库
                    </Badge>
                  )}
                  {agent.databases > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Database className="h-3 w-3" />
                      {agent.databases} 数据库
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Playground Button */}
            <Link
              href={`/chat?type=agent&id=${encodeURIComponent(serverId)}`}
            >
              <Button className="gap-2 whitespace-nowrap">
                <Play className="h-4 w-4" weight="fill" />
                Playground
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="settings">Agent 设定</TabsTrigger>
            <TabsTrigger value="tools">工具</TabsTrigger>
            <TabsTrigger value="skills">技能</TabsTrigger>
            <TabsTrigger value="data">数据资源</TabsTrigger>
          </TabsList>

          {/* 概览 Tab */}
          <TabsContent value="overview">
            <div className="max-w-3xl">
                {/* Collapsible Description */}
                <section className="mb-8">
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="mb-3 flex w-full items-center justify-between text-left"
                  >
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Sparkles className="h-5 w-5" />
                      你可以使用该 Agent 做什么?
                    </h2>
                    {descExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      descExpanded ? "max-h-96" : "max-h-0"
                    )}
                  >
                    <div className="rounded-xl border border-border/50 bg-card p-5">
                      <p className="leading-relaxed text-muted-foreground">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Chat Demo */}
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <MessageSquare className="h-5 w-5" />
                    Agent 演示
                  </h2>
                  <div className="rounded-xl border border-border/50 bg-card p-5">
                    <div className="space-y-4">
                      {agent.chat_demo.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex gap-3",
                            msg.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          )}
                        >
                          {/* Avatar */}
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {msg.role === "assistant" ? (
                              <>
                                <AvatarImage
                                  src={
                                    agent.avatar ||
                                    `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`
                                  }
                                  alt={agent.title}
                                />
                                <AvatarFallback className="text-xs">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </>
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                U
                              </AvatarFallback>
                            )}
                          </Avatar>

                          {/* Message Bubble */}
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50"
                            )}
                          >
                            {msg.content.split("\n").map((line, j) => {
                              if (line.startsWith("**") && line.endsWith("**")) {
                                return (
                                  <p key={j} className="font-semibold">
                                    {line.slice(2, -2)}
                                  </p>
                                )
                              }
                              if (line.startsWith("- ")) {
                                return (
                                  <p key={j} className="ml-2">
                                    &bull; {line.slice(2)}
                                  </p>
                                )
                              }
                              if (line.trim() === "") {
                                return <div key={j} className="h-1.5" />
                              }
                              return <p key={j}>{line}</p>
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
            </div>
          </TabsContent>

          {/* Agent 设定 Tab */}
          <TabsContent value="settings">
            <div className="max-w-3xl">
              <section className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Settings className="h-5 w-5" />
                  系统提示词
                </h2>
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {agent.system_prompt}
                  </pre>
                </div>
              </section>

              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <BrainCircuit className="h-5 w-5" />
                  基本信息
                </h2>
                <div className="rounded-xl border border-border/50 bg-card">
                  <div className="grid grid-cols-2 divide-x divide-border/50">
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">名称</p>
                      <p className="mt-1 font-medium text-foreground">
                        {agent.title}
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">创建者</p>
                      <p className="mt-1 font-medium text-foreground">
                        {agent.owner}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border/50 p-5">
                    <p className="text-sm text-muted-foreground">描述</p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>

          {/* 工具 Tab */}
          <TabsContent value="tools">
            <div className="max-w-3xl space-y-3">
              {agent.tool_list.map((tool, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Wrench className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        {tool.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 技能 Tab */}
          <TabsContent value="skills">
            <div className="max-w-3xl space-y-3">
              {agent.skill_list.map((skill, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Zap className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        {skill.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 数据资源 Tab */}
          <TabsContent value="data">
            <div className="max-w-3xl grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-card p-5 text-center">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">
                  {agent.knowledge}
                </p>
                <p className="text-sm text-muted-foreground">知识库</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5 text-center">
                <Database className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">
                  {agent.databases}
                </p>
                <p className="text-sm text-muted-foreground">数据库</p>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
