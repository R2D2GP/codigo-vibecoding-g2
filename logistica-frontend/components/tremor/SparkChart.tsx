"use client"

import React from "react"
import {
  Area,
  Bar,
  Line,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
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

interface SparkChartProps {
  data: Record<string, any>[]
  categories: string[]
  index: string
  colors?: AvailableChartColorsKeys[]
  type?: "area" | "line" | "bar"
}

export function SparkChart({
  data = [],
  categories = [],
  index,
  colors = AvailableChartColors,
  type = "area",
}: SparkChartProps) {
  const categoryColors = constructCategoryColors(categories, colors)
  const Chart = type === "bar" ? RechartsBarChart : type === "line" ? RechartsLineChart : RechartsAreaChart

  return (
    <div className="h-12 w-full" tremor-id="tremor-raw">
      <ResponsiveContainer width="100%" height={48}>
        <Chart data={data} margin={{ bottom: 1, left: 1, right: 1, top: 1 }}>
          <XAxis hide dataKey={index} />
          <YAxis hide domain={[0, "auto"]} />
          {categories.map((cat) => {
            const color = categoryColors.get(cat) ?? "gray"
            if (type === "bar") {
              return (
                <Bar
                  key={cat}
                  className={getColorClassName(color, "fill")}
                  dataKey={cat}
                  fill=""
                  isAnimationActive={false}
                />
              )
            }
            if (type === "line") {
              return (
                <Line
                  key={cat}
                  className={getColorClassName(color, "stroke")}
                  type="linear"
                  dataKey={cat}
                  stroke=""
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            }
            return (
              <Area
                key={cat}
                className={getColorClassName(color, "stroke")}
                type="linear"
                dataKey={cat}
                stroke=""
                strokeWidth={2}
                fill=""
                isAnimationActive={false}
              />
            )
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
