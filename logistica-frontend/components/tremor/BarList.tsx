"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface Bar<T = unknown> extends Record<string, any> {
  name: string
  value: number
  href?: string
}

interface BarListProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  data: Bar<T>[]
  valueFormatter?: (value: number) => string
  sortOrder?: "ascending" | "descending" | "none"
}

export function BarList<T = unknown>({
  data = [],
  valueFormatter = (v) => v.toString(),
  sortOrder = "descending",
  className,
}: BarListProps<T>) {
  const sorted = React.useMemo(() => {
    if (sortOrder === "none") return data
    return [...data].sort((a, b) =>
      sortOrder === "ascending" ? a.value - b.value : b.value - a.value
    )
  }, [data, sortOrder])

  const maxValue = Math.max(...sorted.map((item) => item.value), 0)

  return (
    <div className={cn("flex justify-between space-x-6", className)} tremor-id="tremor-raw">
      <div className="relative w-full space-y-1.5">
        {sorted.map((item, i) => (
          <div key={item.key ?? item.name} className="group w-full rounded-sm">
            <div
              className="flex items-center rounded-sm bg-blue-200 dark:bg-blue-900 h-8 transition-all"
              style={{ width: `${Math.max((item.value / maxValue) * 100, 2)}%` }}
            >
              <div className="absolute left-2 flex max-w-full pr-2">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer"
                    className="truncate whitespace-nowrap text-sm text-gray-900 dark:text-gray-50 hover:underline"
                  >
                    {item.name}
                  </a>
                ) : (
                  <p className="truncate whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                    {item.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        {sorted.map((item, i) => (
          <div key={item.key ?? item.name} className="flex items-center justify-end h-8 mb-1.5 last:mb-0">
            <p className="truncate whitespace-nowrap text-sm leading-none text-gray-900 dark:text-gray-50">
              {valueFormatter(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
