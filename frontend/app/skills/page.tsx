import LayoutApp from "@/components/layout/layout-app"
import { Suspense } from "react"
import SearchPage from "./search-page"

export default function SkillsPage() {
  return (
    <LayoutApp>
      <div className="pt-app-header relative flex flex-col">
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
            </div>
          }
        >
          <SearchPage />
        </Suspense>
      </div>
    </LayoutApp>
  )
}
