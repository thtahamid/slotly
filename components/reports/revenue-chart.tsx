"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import type { RevenueReport } from "@/types/supabase"

interface RevenueChartProps {
  data: RevenueReport[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format data for the chart
  const chartData = data.map((report) => ({
    date: new Date(report.report_date).toLocaleDateString(),
    revenue: report.daily_revenue || 0,
    sessions: report.total_sessions || 0,
  }))

  return (
    <div className="h-[400px] w-full">
      {data.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-muted-foreground">No data available for the selected period</p>
        </div>
      ) : (
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue",
              color: "hsl(var(--chart-1))",
              valueFormatter: (value: number) => formatCurrency(value),
            },
            sessions: {
              label: "Sessions",
              color: "hsl(var(--chart-2))",
              valueFormatter: (value: number) => `${value} sessions`,
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                name="Revenue"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sessions"
                stroke="var(--color-sessions)"
                name="Sessions"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}
