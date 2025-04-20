import Link from "next/link"
import { ChevronLeft, CircleDollarSign, Clock, MapPin, Percent } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/header"
import { ParkingSpaceTable } from "@/components/dashboard/parking-space-table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getParkingLotById } from "@/app/actions/parking-lots"
import { getParkingSpaces } from "@/app/actions/parking-spaces"
import { createServerSupabaseClient } from "@/lib/supabase/server-client"
import { notFound } from "next/navigation"

export default async function ParkingLotDetail({ params }: { params: { id: string } }) {
  // Fetch the parking lot
  const parkingLot = await getParkingLotById(params.id).catch(() => null)

  if (!parkingLot) {
    notFound()
  }

  // Fetch the parking spaces
  const parkingSpaces = await getParkingSpaces(params.id)

  // Calculate statistics
  const totalSpaces = parkingSpaces.length
  const occupiedSpaces = parkingSpaces.filter((space) => space.status === "occupied").length
  const availableSpaces = parkingSpaces.filter((space) => space.status === "available").length
  const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0

  // Get today's revenue for this lot
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: sessions, error: sessionsError } = await supabase
    .from("parking_sessions")
    .select("total_cost, parking_space_id, parking_spaces!inner(lot_id)")
    .eq("parking_spaces.lot_id", params.id)
    .gte("start_time", `${today}T00:00:00`)
    .lte("start_time", `${today}T23:59:59`)

  if (sessionsError) {
    console.error(`Error fetching sessions for lot ${params.id}:`, sessionsError)
  }

  // Calculate revenue
  const revenue = sessions?.reduce((sum, session) => sum + (session.total_cost || 0), 0) || 0

  // Format parking spaces for the table
  const formattedSpaces = await Promise.all(
    parkingSpaces.map(async (space) => {
      // If the space is occupied, get the active session
      let vehicle, checkInTime, duration, fee
      if (space.status === "occupied") {
        const { data: session, error: sessionError } = await supabase
          .from("parking_sessions")
          .select("*")
          .eq("parking_space_id", space.id)
          .is("end_time", null)
          .single()

        if (!sessionError && session) {
          vehicle = {
            licensePlate: session.vehicle_license_plate || "Unknown",
            type: session.vehicle_type || "Unknown",
          }

          // Format check-in time
          const checkInDate = new Date(session.start_time)
          checkInTime = checkInDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

          // Calculate duration in minutes
          const now = new Date()
          duration = Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60))

          // Calculate current fee
          const hourlyRate = parkingLot.hourly_rate || 0
          fee = (duration / 60) * hourlyRate
        }
      }

      return {
        id: space.id,
        spaceNumber: space.space_number,
        status: space.status,
        spaceType: space.space_type,
        vehicle,
        checkInTime,
        duration,
        fee,
      }
    }),
  )

  return (
    <main className="min-h-screen">
      <DashboardHeader />
      <div className="container py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">{parkingLot.name}</h1>
            <p className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {parkingLot.location}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/parking-lots/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit Details
              </Button>
            </Link>
            <form action={`/api/parking-lots/${params.id}/delete`} method="POST">
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="bg-danger-light text-danger hover:bg-danger hover:text-white"
              >
                Delete
              </Button>
            </form>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            description={`${occupiedSpaces}/${totalSpaces} spaces occupied`}
            icon={Percent}
          />
          <StatsCard
            title="Daily Revenue"
            value={formatCurrency(revenue)}
            description={`Hourly rate: ${formatCurrency(parkingLot.hourly_rate || 0)}`}
            icon={CircleDollarSign}
          />
          <StatsCard
            title="Operating Hours"
            value={parkingLot.operating_hours || "24/7"}
            description="Current operating schedule"
            icon={Clock}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${parkingLot.is_covered ? "bg-success" : "bg-muted"}`}></div>
                  <span>Covered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${parkingLot.has_ev_charging ? "bg-success" : "bg-muted"}`}
                  ></div>
                  <span>EV Charging</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${parkingLot.has_handicap_spaces ? "bg-success" : "bg-muted"}`}
                  ></div>
                  <span>Handicap</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Parking Spaces</CardTitle>
            <CardDescription>Manage all parking spaces in {parkingLot.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <ParkingSpaceTable parkingLotId={params.id} spaces={formattedSpaces} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
