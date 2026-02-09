"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getSkillCategories,
  searchSkills,
  SkillCategory,
  SkillSearchItem,
  SkillSearchParams,
} from "@/lib/skill"
import { PaginatedData } from "@/lib/mcp"
import { cn } from "@/lib/utils"
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
} from "@phosphor-icons/react"
import {
  Boxes,
  CheckCircle2,
  Sparkles,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

export default function SearchPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [searchResponse, setSearchResponse] =
    useState<PaginatedData<SkillSearchItem> | null>(null)
  const [skills, setSkills] = useState<SkillSearchItem[]>([])
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  const pageSize = 20
  const totalSkills = searchResponse?.total || 0
  const totalPages = searchResponse?.total_pages || 1

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoryLoading(true)
        const data = await getSkillCategories()
        setCategories(data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      } finally {
        setIsCategoryLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch skills
  const fetchSkills = useCallback(
    async (page: number, categoryId: number, keyword: string) => {
      try {
        setIsLoading(true)
        const params: SkillSearchParams = {
          page,
          size: pageSize,
          category_id: categoryId,
          keyword,
        }
        const data = await searchSkills(params)
        setSearchResponse(data)
        setSkills(data.items)
      } catch (err) {
        console.error("Error fetching skills:", err)
        setSkills([])
        setSearchResponse(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Initial fetch
  useEffect(() => {
    fetchSkills(1, 0, "")
  }, [fetchSkills])

  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setCurrentPage(1)
    fetchSkills(1, categoryId, searchQuery)
  }

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchSkills(1, selectedCategoryId, value)
    }, 400)
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
      setCurrentPage(1)
      fetchSkills(1, selectedCategoryId, searchQuery)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchSkills(page, selectedCategoryId, searchQuery)
  }

  // Format favorite count
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`
    }
    return count.toLocaleString()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Sidebar - Categories */}
      <aside className="sticky top-[var(--spacing-app-header)] h-[calc(100vh-var(--spacing-app-header))] w-[220px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
        <ScrollArea className="h-full">
          <div className="py-3 pr-2">
            {/* All category */}
            <button
              onClick={() => handleCategoryClick(0)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors",
                selectedCategoryId === 0
                  ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Boxes className="h-4 w-4" />
                <span>全部</span>
              </div>
              {totalSkills > 0 && selectedCategoryId === 0 && (
                <span className="text-xs text-gray-400">{totalSkills}</span>
              )}
            </button>

            {/* Category list */}
            {isCategoryLoading ? (
              <div className="space-y-2 px-4 py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-1 space-y-0.5">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors",
                      selectedCategoryId === category.id
                        ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <span className="truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Right Content */}
      <main className="min-w-0 flex-1">
        <div className="py-3 pl-6">
          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <MagnifyingGlass className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="搜索 Skill 名称或关键词..."
                className="h-10 rounded-lg border-gray-200 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Link href="/build/skill">
              <Button variant="outline" className="h-10 gap-2 whitespace-nowrap">
                <Sparkles className="h-4 w-4" />
                提交 Skill
              </Button>
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="mt-2.5 space-y-2 pl-12">
                    <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skill List */}
          {!isLoading && (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {skills.map((skill, index) => (
                <div
                  key={`${skill.owner}-${skill.name}-${index}`}
                  className="group py-5 first:pt-0"
                >
                  {/* Row 1: Avatar + owner/name + verified + star count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage
                          src={`https://github.com/${skill.owner}.png`}
                          alt={skill.owner}
                        />
                        <AvatarFallback className="bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {skill.owner.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/skills/${skill.owner}/${skill.name}`}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-base font-semibold text-orange-500 transition-colors hover:text-orange-400 dark:text-orange-400 dark:hover:text-orange-300">
                          {skill.owner}/{skill.name}
                        </span>
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      </Link>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <Star className="h-4 w-4" />
                      <span>{formatCount(skill.favorite_count)}</span>
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  <p className="mt-1.5 line-clamp-2 pl-12 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {skill.description}
                  </p>
                </div>
              ))}

              {/* Empty state */}
              {skills.length === 0 && (
                <div className="py-16 text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    未找到匹配的 Skill
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                共 {totalSkills} 个 Skill，第 {currentPage}/{totalPages} 页
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <CaretLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1
                  const shouldShow =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1

                  if (!shouldShow) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="px-1 text-xs text-gray-400"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 text-xs"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <CaretRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
