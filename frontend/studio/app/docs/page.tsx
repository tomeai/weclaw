import LayoutApp from "@/app/components/layout/layout-app"
import DocsContent from "@/app/docs/docs-content"
import { cn } from "@/lib/utils"

export default function DocsPage() {
  return (
    // @ts-ignore
    <LayoutApp>
      <div
        className={cn(
          "@container/main relative flex h-full min-h-screen flex-col items-center justify-start"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-4xl">
              文档
            </h1>
            <p className="mb-4 text-gray-600">
              Comprehensive guides and references
            </p>
          </div>

          {/* Docs Content (Client Component) */}
          <DocsContent />
        </div>
      </div>
    </LayoutApp>
  )
}
