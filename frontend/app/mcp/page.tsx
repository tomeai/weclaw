import LayoutApp from "@/app/components/layout/layout-app"
import { cn } from "@/lib/utils"
import SearchPage from "./search-page"
import { Suspense } from "react"

export default function McpPage() {
  return (
    <LayoutApp>
      <div
        className={cn(
          "@container/main relative flex h-full flex-col items-center justify-start min-h-screen"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
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
