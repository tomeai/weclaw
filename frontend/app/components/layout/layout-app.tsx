"use client"

import { Header } from "./header"
import Footer from "./footer"

export default function LayoutApp({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="isolate">
      <div className="bg-background @container/mainview relative flex h-full w-full">
        <main className="@container relative h-dvh w-0 flex-shrink flex-grow flex flex-col">
          <Header />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
