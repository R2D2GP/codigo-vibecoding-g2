"use client"

import React from "react"
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Sector, Tooltip, Cell } from "recharts"
import {
  AvailableChartColors,
  chartColors,
  constructCategoryColors,
  getColorClassName,
  type AvailableChartColorsKeys,
} from "@/lib/chartUtils"
import { cn } from "@/lib/utils"

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[]
  category: string
  value: string
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  variant?: "donut" | "pie"
  showLabel?: boolean
}

export function DonutChart({
  data = [],
  category,
  value,
  colors = AvailableChartColors,
  valueFormatter = (v) => v.toString(),
  variant = "donut",
  showLabel = false,
  className,
}: DonutChartProps) {
  const categories = Array.from(new Set(data.map((item) => item[category])))
  const categoryColors = constructCategoryColors(categories, colors)
  const isDonut = variant === "donut"
  const total = React.useMemo(() => data.reduce((s, d) => s + d[value], 0), [data, value])

  return (
    <div className={cn("h-64 w-full", className)} tremor-id="tremor-raw">
      <ResponsiveContainer width="100%" height={256}>
        <RechartsPieChart margin={{ top: 5, bottom: 5, left: 5, right: 5 }}>
          {showLabel && isDonut && (
            <text
              className="fill-gray-700 text-sm font-medium dark:fill-gray-300"
              x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
            >
              {valueFormatter(total)}
            </text>
          )}
          <Pie
            data={data}
            cx="50%" cy="50%"
            startAngle={90} endAngle={-270}
            innerRadius={isDonut ? "50%" : "0%"}
            outerRadius="80%"
            dataKey={value}
            nameKey={category}
            stroke="white"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((entry, i) => {
              const cat = entry[category]
              const color = categoryColors.get(cat) ?? "gray"
              return <Cell key={i} fill={chartColors[color]?.hex ?? "#6b7280"} />
            })}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]
              return (
                <div className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm shadow-md dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                      <span className={cn("size-2 shrink-0 rounded-full", getColorClassName(categoryColors.get(p.name as string) ?? "gray", "bg"))} />
                            <span className="font-medium text-gray-900 dark:text-gray-50">{p.name as string}</span>
                    <span className="tabular-nums text-gray-500">{valueFormatter(p.value as number)}</span>
                  </div>
                </div>
              )
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
        {categories.map((cat) => (
          <span key={cat} className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
            <span className={cn("size-2 shrink-0 rounded-full", getColorClassName(categoryColors.get(cat) ?? "gray", "bg"))} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}
