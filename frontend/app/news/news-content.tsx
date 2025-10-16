"use client"

import { Card, CardContent } from "@/components/ui/card"

// Sample news data with varying content lengths
const newsItems = [
  {
    id: 1,
    title: "New MCP Server Integration",
    date: "2025-04-05",
    content:
      "We've added integration with the latest MCP server that provides advanced weather data processing capabilities. This allows for more accurate forecasting models and real-time updates.",
  },
  {
    id: 2,
    title: "Performance Improvements",
    date: "2025-04-03",
    content:
      "Our latest update includes significant performance optimizations. Response times have been reduced by 40% across all API endpoints, and memory usage is down by 25%.",
  },
  {
    id: 3,
    title: "New Documentation Portal",
    date: "2025-03-28",
    content:
      "We're excited to announce our new documentation portal with improved search functionality, code examples, and interactive API references. The new portal makes it easier than ever to integrate with our services.\n\nKey features:\n- Interactive API playground\n- Improved search\n- Code samples in multiple languages",
  },
  {
    id: 4,
    title: "Security Update",
    date: "2025-03-25",
    content:
      "We've implemented enhanced security measures including:\n- Improved authentication protocols\n- Rate limiting\n- Additional encryption layers\n\nAll users are encouraged to update their client libraries.",
  },
  {
    id: 5,
    title: "New Pricing Plans",
    date: "2025-03-20",
    content:
      "Based on user feedback, we've introduced new pricing tiers with more flexible options for teams of all sizes. The new plans include:\n\n- Free tier with basic features\n- Pro tier with advanced capabilities\n- Enterprise solutions",
  },
  {
    id: 6,
    title: "Community Spotlight",
    date: "2025-03-15",
    content:
      "This month we're highlighting several innovative projects from our community that showcase creative uses of our platform. Check out the featured projects in our community forum.",
  },
]

export default function NewsContent() {
  return (
    <>
      {/* True Masonry Layout */}
      <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
        {newsItems.map((item) => (
          <Card key={item.id} className="w-full break-inside-avoid">
            <CardContent className="px-6 py-3">
              <div className="flex h-full flex-col">
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="mb-2 text-sm text-gray-500">{item.date}</p>
                <div className="flex-grow">
                  <p className="mb-2 text-sm whitespace-pre-line">
                    {item.content}
                  </p>
                  {/* Fixed height spacers for variation */}
                  <div
                    className={
                      ["h-8", "h-12", "h-16", "h-20", "h-24", "h-28"][
                        item.id % 6
                      ]
                    }
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
