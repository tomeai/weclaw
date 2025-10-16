import LayoutApp from "@/app/components/layout/layout-app"
import {cn} from "@/lib/utils"
import PricingContent from "./pricing-content"

export default function PricingPage() {
  return (
    <LayoutApp>
      <div
        className={cn(
            "@container/main relative flex h-full flex-col items-center justify-start min-h-screen"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              价格
            </h1>
            <p className="text-gray-600">
              Choose the plan that works for you
            </p>
          </div>

          {/* Pricing Content (Client Component) */}
          <PricingContent />
        </div>
      </div>
    </LayoutApp>
  )
}
