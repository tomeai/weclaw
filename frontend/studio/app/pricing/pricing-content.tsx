"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Pricing plan features
const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    billing: "forever",
    description: "Perfect for getting started with MCP servers",
    features: [
      "Access to 10 MCP servers",
      "100 API calls per day",
      "Community support",
      "Basic documentation",
      "1 project",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$20",
    billing: "per month",
    description: "Great for individuals and small teams",
    features: [
      "Access to all MCP servers",
      "Unlimited API calls",
      "Priority support",
      "Advanced documentation",
      "10 projects",
      "Custom integrations",
    ],
    buttonText: "Subscribe Now",
    buttonVariant: "default" as const,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$40",
    billing: "per user/month",
    description: "For organizations with advanced needs",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom MCP server development",
      "SLA guarantees",
      "Unlimited projects",
      "Advanced security features",
      "Team management",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
]

export default function PricingContent() {
  return (
    <>
      {/* Pricing Cards */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className={cn(
              "flex h-full flex-col rounded-xl border p-6",
              plan.highlighted && "border-primary relative shadow-lg"
            )}
          >
            {plan.highlighted && (
              <div className="bg-primary absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full px-3 py-1 text-xs font-bold text-white">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="ml-1 text-gray-500">/{plan.billing}</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant={plan.buttonVariant}
                className={cn(
                  "w-full",
                  plan.highlighted && "bg-primary hover:bg-primary/90"
                )}
              >
                {plan.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
