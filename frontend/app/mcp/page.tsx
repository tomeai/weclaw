import LayoutApp from "@/components/layout/layout-app"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
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
          {/* Client Component for interactive elements */}
          <div className="mb-16">
            <Suspense fallback={<div>Loading...</div>}>
              <SearchPage />
            </Suspense>
          </div>
        </div>
      </div>
    </LayoutApp>
  )
}
