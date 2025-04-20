import { DashboardHeader } from "@/components/dashboard/header"
import { RevenueChart } from "@/components/reports/revenue-chart"
import { OccupancyChart } from "@/components/reports/occupancy-chart"
import { ReportFilters } from "@/components/reports/report-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getParkingLots } from "@/app/actions/parking-lots"
import { getRevenueReports } from "@/app/actions/reports"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { lotId?: string; period?: string; startDate?: string; endDate?: string }
}) {
  // Get all parking lots for the filter
  const parkingLots = await getParkingLots()

  // Default to the first parking lot if none is selected
  const lotId = searchParams.lotId || (parkingLots.length > 0 ? parkingLots[0].id : "")

  // Default period is 'week' if not specified
  const period = searchParams.period || "week"

  // Calculate default date range based on period
  const today = new Date()
  let startDate = searchParams.startDate
  const endDate = searchParams.endDate || today.toISOString().split("T")[0]

  if (!startDate) {
    if (period === "week") {
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)
      startDate = lastWeek.toISOString().split("T")[0]
    } else if (period === "month") {
      const lastMonth = new Date(today)
      lastMonth.setMonth(today.getMonth() - 1)
      startDate = lastMonth.toISOString().split("T")[0]
    } else if (period === "year") {
      const lastYear = new Date(today)
      lastYear.setFullYear(today.getFullYear() - 1)
      startDate = lastYear.toISOString().split("T")[0]
    }
  }

  // Get report data
  const revenueData = lotId ? await getRevenueReports(lotId, startDate, endDate) : []

  return (
    <main className="min-h-screen">
      <DashboardHeader />
      <div className="container py-6">
        <h1 className="mb-6 text-2xl font-bold">Reports & Analytics</h1>

        <ReportFilters parkingLots={parkingLots} />

        <Tabs defaultValue="revenue" className="mt-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Track your revenue over time across all parking lots</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="occupancy" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Analysis</CardTitle>
                <CardDescription>Monitor parking space utilization and peak hours</CardDescription>
              </CardHeader>
              <CardContent>
                <OccupancyChart data={revenueData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
