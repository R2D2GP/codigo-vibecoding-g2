"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, useEffect, useRef } from "react"
import { Toaster } from "@/components/ui/sonner"

let globalClient: QueryClient | null = null

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use a module-level singleton to avoid React 19 SSR re-using the
  // useState-initialized QueryClient. The singleton is created once on
  // the client and survives HMR without stale SSR cache.
  const [queryClient] = useState(() => {
    if (globalClient) return globalClient
    globalClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
      },
    })
    if (typeof window !== "undefined") {
      ;(window as any).__QC = globalClient
    }
    return globalClient
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
