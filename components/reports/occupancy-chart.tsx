"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { RevenueReport } from "@/types/supabase"

interface OccupancyChartProps {
  data: RevenueReport[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  // Format data for the chart
  const chartData = data.map((report) => ({
    date: new Date(report.report_date).toLocaleDateString(),
    occupancy: report.occupied_spaces_percentage || 0,
    avgDuration: report.avg_session_duration
      ? Number.parseInt(report.avg_session_duration.toString().split(":")[0]) +
        Number.parseInt(report.avg_session_duration.toString().split(":")[1]) / 60
      : 0,
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
            occupancy: {
              label: "Occupancy Rate",
              color: "hsl(var(--chart-1))",
              valueFormatter: (value: number) => `${value.toFixed(1)}%`,
            },
            avgDuration: {
              label: "Avg. Duration",
              color: "hsl(var(--chart-2))",
              valueFormatter: (value: number) => `${value.toFixed(1)} hours`,
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="occupancy"
                fill="var(--color-occupancy)"
                name="Occupancy Rate"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="avgDuration"
                fill="var(--color-avgDuration)"
                name="Avg. Duration"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}
