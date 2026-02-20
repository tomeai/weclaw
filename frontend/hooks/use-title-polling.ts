"use client"

import http from "@/lib/http"
import { useEffect, useRef, useState } from "react"

type TitleResponse = {
  thread_id: string
  chat_title: string
  title_generated: boolean
}

type Options = {
  interval?: number
  maxAttempts?: number
}

export function useTitlePolling(
  onTitleResolved: (threadId: string, title: string) => void,
  { interval = 1500, maxAttempts = 10 }: Options = {},
) {
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set())
  const countsRef = useRef<Map<string, number>>(new Map())

  // 启动对某个 thread 的轮询
  const startPolling = (threadId: string) => {
    countsRef.current.set(threadId, 0)
    setPollingIds((prev) => new Set(prev).add(threadId))
  }

  useEffect(() => {
    if (pollingIds.size === 0) return

    const timer = setInterval(async () => {
      const toStop: string[] = []

      for (const tid of pollingIds) {
        const count = (countsRef.current.get(tid) ?? 0) + 1
        countsRef.current.set(tid, count)

        try {
          const data = await http.get<TitleResponse>(`/api/v1/agent/threads/${tid}/title`)
          if (data.title_generated) {
            onTitleResolved(tid, data.chat_title)
            toStop.push(tid)
          } else if (count >= maxAttempts) {
            toStop.push(tid)
          }
        } catch {
          if (count >= maxAttempts) toStop.push(tid)
        }
      }

      if (toStop.length > 0) {
        toStop.forEach((tid) => countsRef.current.delete(tid))
        setPollingIds((prev) => {
          const next = new Set(prev)
          toStop.forEach((tid) => next.delete(tid))
          return next
        })
      }
    }, interval)

    return () => clearInterval(timer)
  }, [pollingIds, interval, maxAttempts, onTitleResolved])

  return { startPolling }
}
