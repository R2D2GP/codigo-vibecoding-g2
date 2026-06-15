"use client"

import React from "react"
import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
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

interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
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
  startEndOnly?: boolean
}

export function AreaChart({
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
  startEndOnly = false,
  className,
}: AreaChartProps) {
  const categoryColors = constructCategoryColors(categories, colors)
  const stacked = type === "stacked" || type === "percent"

  return (
    <div className={cn("h-80 w-full", className)} tremor-id="tremor-raw">
      <ResponsiveContainer width="100%" height={320}>
        <RechartsAreaChart
          data={data}
          margin={{ bottom: 5, left: 5, right: 5, top: 5 }}
          stackOffset={type === "percent" ? "expand" : undefined}
        >
          {showGridLines && (
            <CartesianGrid
              className="stroke-gray-200 dark:stroke-gray-800"
              horizontal={true}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={index}
            tick={{ transform: "translate(0, 6)" }}
            ticks={startEndOnly ? [data[0]?.[index], data[data.length - 1]?.[index]] : undefined}
            interval={startEndOnly ? "preserveStartEnd" : "equidistantPreserveStart"}
            className="text-xs fill-gray-500 dark:fill-gray-500"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={yAxisWidth}
            hide={!showYAxis}
            tickFormatter={type === "percent" ? (v: number) => `${(v * 100).toFixed(0)}%` : valueFormatter}
            className="text-xs fill-gray-500 dark:fill-gray-500"
            tickLine={false}
            axisLine={false}
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
                            <span className={cn("h-[3px] w-3.5 shrink-0 rounded-full", getColorClassName(color, "bg"))} />
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
                  <span className={cn("h-[3px] w-3.5 shrink-0 rounded-full", getColorClassName(categoryColors.get(cat) ?? "gray", "bg"))} />
                  {cat}
                </span>
              ))}
            </div>
          )}
          {categories.map((category) => {
            const catId = category.replace(/[^a-zA-Z0-9]/g, "")
            return (
              <React.Fragment key={category}>
                <defs>
                  <linearGradient id={catId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  className={getColorClassName(categoryColors.get(category) ?? "gray", "stroke")}
                  type="linear"
                  dataKey={category}
                  stroke=""
                  strokeWidth={2}
                  fill={`url(#${catId})`}
                  stackId={stacked ? "stack" : undefined}
                  isAnimationActive={false}
                />
              </React.Fragment>
            )
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
