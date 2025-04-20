import { DashboardHeader } from "@/components/dashboard/header"
import { ParkingLotCard } from "@/components/dashboard/parking-lot-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Car, CircleDollarSign, Clock, Percent } from "lucide-react"
import { getParkingLots } from "@/app/actions/parking-lots"
import { createServerSupabaseClient } from "@/lib/supabase/server-client"

export default async function Home() {
  // Fetch parking lots from the database
  const parkingLots = await getParkingLots()

  // Calculate overall statistics
  const supabase = createServerSupabaseClient()

  // Get total spaces and occupied spaces
  const { data: spacesData, error: spacesError } = await supabase.from("parking_spaces").select("status")

  if (spacesError) {
    console.error("Error fetching parking spaces:", spacesError)
  }

  const totalSpaces = spacesData?.length || 0
  const occupiedSpaces = spacesData?.filter((space) => space.status === "occupied").length || 0
  const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0

  // Get today's revenue
  const today = new Date().toISOString().split("T")[0]
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("parking_sessions")
    .select("total_cost, start_time, end_time")
    .gte("start_time", `${today}T00:00:00`)
    .lte("start_time", `${today}T23:59:59`)

  if (sessionsError) {
    console.error("Error fetching parking sessions:", sessionsError)
  }

  // Calculate revenue and average parking time
  const totalRevenue = sessionsData?.reduce((sum, session) => sum + (session.total_cost || 0), 0) || 0

  // Calculate average parking time for completed sessions
  const completedSessions = sessionsData?.filter((session) => session.end_time) || []
  let totalDuration = 0

  for (const session of completedSessions) {
    if (session.start_time && session.end_time) {
      const startTime = new Date(session.start_time).getTime()
      const endTime = new Date(session.end_time).getTime()
      totalDuration += endTime - startTime
    }
  }

  const avgParkingTimeHours =
    completedSessions.length > 0 ? (totalDuration / completedSessions.length / (1000 * 60 * 60)).toFixed(1) : "0.0"

  // Prepare stats for the dashboard
  const stats = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(2)}`,
      description: "Today's revenue from all parking lots",
      icon: CircleDollarSign,
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      description: `${occupiedSpaces}/${totalSpaces} spaces occupied`,
      icon: Percent,
    },
    {
      title: "Total Spaces",
      value: totalSpaces.toString(),
      description: "Across all parking lots",
      icon: Car,
    },
    {
      title: "Avg. Parking Time",
      value: `${avgParkingTimeHours} hrs`,
      description: "Average duration per vehicle",
      icon: Clock,
    },
  ]

  return (
    <main className="min-h-screen">
      <DashboardHeader />
      <div className="container py-6">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </div>

        <h2 className="mb-4 text-xl font-semibold">Parking Lots</h2>
        {parkingLots.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">No parking lots found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get started by adding your first parking lot.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {parkingLots.map((lot) => (
              <ParkingLotCard
                key={lot.id}
                id={lot.id}
                name={lot.name}
                location={lot.location}
                totalSpaces={lot.total_spaces}
                hourlyRate={lot.hourly_rate || 0}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
