"use client"

import React from "react"
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AvailableChartColors,
  constructCategoryColors,
  getColorClassName,
  type AvailableChartColorsKeys,
} from "@/lib/chartUtils"
import { cn } from "@/lib/utils"

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  showYAxis?: boolean
  showGridLines?: boolean
  yAxisWidth?: number
  showLegend?: boolean
  type?: "default" | "stacked" | "percent"
  layout?: "vertical" | "horizontal"
}

export function BarChart({
  data = [],
  categories = [],
  index,
  colors = AvailableChartColors,
  valueFormatter = (v) => v.toString(),
  showYAxis = true,
  showGridLines = true,
  yAxisWidth = 56,
  showLegend = true,
  type = "default",
  layout = "horizontal",
  className,
}: BarChartProps) {
  const categoryColors = constructCategoryColors(categories, colors)
  const stacked = type === "stacked" || type === "percent"

  return (
    <div className={cn("h-80 w-full", className)} tremor-id="tremor-raw">
      <ResponsiveContainer width="100%" height={320}>
        <RechartsBarChart
          data={data}
          margin={{ bottom: 5, left: 5, right: 5, top: 5 }}
          stackOffset={type === "percent" ? "expand" : undefined}
          layout={layout}
        >
          {showGridLines && (
            <CartesianGrid
              className="stroke-gray-200 dark:stroke-gray-800"
              horizontal={layout !== "vertical"}
              vertical={layout === "vertical"}
            />
          )}
          <XAxis
            dataKey={layout === "horizontal" ? index : undefined}
            tick={{ transform: "translate(0, 6)" }}
            className="text-xs fill-gray-500 dark:fill-gray-500"
            tickLine={false}
            axisLine={false}
            type={layout === "vertical" ? "number" : "category"}
            domain={layout === "vertical" ? [0, "auto"] : undefined}
          />
          <YAxis
            width={yAxisWidth}
            hide={!showYAxis}
            className="text-xs fill-gray-500 dark:fill-gray-500"
            tickLine={false}
            axisLine={false}
            dataKey={layout === "vertical" ? index : undefined}
            type={layout === "vertical" ? "category" : "number"}
            domain={layout === "horizontal" ? [0, "auto"] : undefined}
            tickFormatter={layout === "horizontal" ? valueFormatter : undefined}
          />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm shadow-md dark:border-gray-800 dark:bg-gray-950">
                  <p className="font-medium text-gray-900 dark:text-gray-50">{label}</p>
                  <div className="space-y-1 pt-1">
                    {payload.map((item: any) => {
                      const color = categoryColors.get(item.dataKey) ?? "blue"
                      return (
                        <div key={item.dataKey} className="flex items-center justify-between space-x-8">
                          <span className="flex items-center gap-1.5">
                            <span className={cn("size-2 shrink-0 rounded-xs", getColorClassName(color, "bg"))} />
                            <span className="text-gray-700 dark:text-gray-300">{item.dataKey}</span>
                          </span>
                          <span className="font-medium tabular-nums text-gray-900 dark:text-gray-50">
                            {valueFormatter(item.value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }}
          />
          {showLegend && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {categories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                  <span className={cn("size-2 shrink-0 rounded-xs", getColorClassName(categoryColors.get(cat) ?? "gray", "bg"))} />
                  {cat}
                </span>
              ))}
            </div>
          )}
          {categories.map((category) => (
            <Bar
              className={cn(
                getColorClassName(categoryColors.get(category) ?? "gray", "fill"),
              )}
              key={category}
              dataKey={category}
              stackId={stacked ? "stack" : undefined}
              isAnimationActive={false}
              fill=""
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
