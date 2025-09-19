import LayoutApp from "@/app/components/layout/layout-app"
import { cn } from "@/lib/utils"
import SearchPage from "./search-page"

export default function McpPage() {
  return (
    <LayoutApp>
      <div
        className={cn(
          "@container/main relative flex h-full min-h-screen flex-col items-center justify-start"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          {/* Header Section */}
          <div className="mb-12 text-center md:mb-10">
            <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-4xl">
              智能体市场
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              基于多维评分，帮你打造更强大的 AI 系统。
            </p>
          </div>

          {/* Client Component for interactive elements */}
          <div className="mb-16">
            <SearchPage />
          </div>
        </div>
      </div>
    </LayoutApp>
  )
}
