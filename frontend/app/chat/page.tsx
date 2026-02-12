import { Header } from "@/components/layout/header"
import { Suspense } from "react"
import ChatClient from "./page-client"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; owner?: string; name?: string }>
}) {
  const { type, owner, name } = await searchParams

  return (
    <div className="isolate">
      <div className="bg-background @container/mainview relative flex h-full w-full">
        <main className="@container relative h-dvh w-0 flex-shrink flex-grow flex flex-col">
          <Header />
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
              </div>
            }
          >
            <ChatClient type={type} owner={owner} name={name} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
