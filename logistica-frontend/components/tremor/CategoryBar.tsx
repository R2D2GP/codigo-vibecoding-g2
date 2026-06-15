"use client"

import React from "react"
import {
  AvailableChartColors,
  getColorClassName,
  type AvailableChartColorsKeys,
} from "@/lib/chartUtils"
import { cn } from "@/lib/utils"

const sumNumericArray = (arr: number[]) => arr.reduce((s, n) => s + n, 0)

interface CategoryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  values: number[]
  colors?: AvailableChartColorsKeys[]
  marker?: { value: number; tooltip?: string; showAnimation?: boolean }
  showLabels?: boolean
}

export function CategoryBar({
  values = [],
  colors = AvailableChartColors,
  marker,
  showLabels = true,
  className,
}: CategoryBarProps) {
  const maxValue = sumNumericArray(values)
  const markerPos = marker ? ((marker.value / maxValue) * 100) : 0

  return (
    <div className={cn(className)} tremor-id="tremor-raw">
      {showLabels && (
        <div className="relative mb-2 flex h-5 w-full text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="absolute bottom-0 left-0">0</div>
          <div className="absolute right-0 bottom-0">{maxValue}</div>
        </div>
      )}
      <div className="relative flex h-2 w-full items-center">
        <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full">
          {values.map((v, i) => {
            const pct = (v / maxValue) * 100
            const color = colors[i] ?? "gray"
            return (
              <div
                key={i}
                className={cn("h-full", getColorClassName(color, "bg"), pct === 0 && "hidden")}
                style={{ width: `${pct}%` }}
              />
            )
          })}
        </div>
        {marker && (
          <div
            className={cn(
              "absolute w-2 -translate-x-1/2",
              marker.showAnimation && "transition-all duration-300 ease-in-out"
            )}
            style={{ left: `${markerPos}%` }}
          >
            <div className={cn(
              "mx-auto h-4 w-1 rounded-full ring-2 ring-white dark:ring-gray-950",
              getColorClassName(colors[values.length - 1] ?? "gray", "bg")
            )} />
          </div>
        )}
      </div>
    </div>
  )
}
