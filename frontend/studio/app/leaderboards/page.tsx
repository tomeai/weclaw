import LayoutApp from "@/app/components/layout/layout-app"
import { cn } from "@/lib/utils"
import LeaderboardContent from "./leaderboard-content"

export default function FeedPage() {
  return (
    <LayoutApp>
      <div
        className={cn(
          "@container/main relative flex h-full flex-col items-center justify-start pt-12 md:pt-16"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-2 text-3xl font-bold">Feed</h1>
            <p className="text-gray-600">
              Recent MCP Servers and Clients submitted by users
            </p>
          </div>

          {/* Feed Content */}
          <LeaderboardContent />
        </div>
      </div>
    </LayoutApp>
  )
}
