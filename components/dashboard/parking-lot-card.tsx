import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, Car, CircleDollarSign } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { createServerSupabaseClient } from "@/lib/supabase/server-client"

interface ParkingLotCardProps {
  id: string
  name: string
  location: string
  totalSpaces: number
  hourlyRate: number
}

export async function ParkingLotCard({ id, name, location, totalSpaces, hourlyRate }: ParkingLotCardProps) {
  const supabase = createServerSupabaseClient()

  // Get parking spaces for this lot
  const { data: spaces, error: spacesError } = await supabase.from("parking_spaces").select("status").eq("lot_id", id)

  if (spacesError) {
    console.error(`Error fetching spaces for lot ${id}:`, spacesError)
  }

  // Calculate occupancy
  const occupiedSpaces = spaces?.filter((space) => space.status === "occupied").length || 0
  const availableSpaces = (spaces?.length || 0) - occupiedSpaces
  const occupancyRate = spaces?.length ? Math.round((occupiedSpaces / spaces.length) * 100) : 0

  // Get today's revenue for this lot
  const today = new Date().toISOString().split("T")[0]
  const { data: sessions, error: sessionsError } = await supabase
    .from("parking_sessions")
    .select("total_cost, parking_space_id")
    .eq("parking_space_id", id)
    .gte("start_time", `${today}T00:00:00`)
    .lte("start_time", `${today}T23:59:59`)

  if (sessionsError) {
    console.error(`Error fetching sessions for lot ${id}:`, sessionsError)
  }

  // Calculate revenue
  const revenue = sessions?.reduce((sum, session) => sum + (session.total_cost || 0), 0) || 0

  // Determine color based on occupancy rate
  let gradientColors = "from-green-400 to-green-500"
  if (occupancyRate > 80) {
    gradientColors = "from-red-400 to-red-500"
  } else if (occupancyRate > 50) {
    gradientColors = "from-amber-400 to-amber-500"
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 w-full bg-gradient-to-r ${gradientColors} dark:bg-none dark:h-0`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{name}</CardTitle>
        <CardDescription className="flex items-center text-xs">
          <MapPin className="mr-1 h-3 w-3" />
          {location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Occupancy</span>
            <span className="font-medium">{occupancyRate}%</span>
          </div>
          <Progress
            value={occupancyRate}
            className="h-2"
            indicatorClassName={
              occupancyRate > 80
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : occupancyRate > 50
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-green-400 to-green-500"
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Available</span>
            <div className="flex items-center">
              <Car className="mr-1 h-4 w-4 text-green-500" />
              <span className="font-medium">{availableSpaces} spaces</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Occupied</span>
            <div className="flex items-center">
              <Car className="mr-1 h-4 w-4 text-red-500" />
              <span className="font-medium">{occupiedSpaces} spaces</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Revenue</span>
            <div className="flex items-center">
              <CircleDollarSign className="mr-1 h-4 w-4 text-primary-gradient-start" />
              <span className="font-medium">{formatCurrency(revenue)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Rate</span>
            <span className="font-medium">{formatCurrency(hourlyRate)}/hr</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link
          href={`/parking-lots/${id}`}
          className="w-full rounded-md bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          Manage Spaces
        </Link>
      </CardFooter>
    </Card>
  )
}
