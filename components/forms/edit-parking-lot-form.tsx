"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { updateParkingLot } from "@/app/actions/parking-lots"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { ParkingLot } from "@/types/supabase"

interface EditParkingLotFormProps {
  parkingLot: ParkingLot
}

export function EditParkingLotForm({ parkingLot }: EditParkingLotFormProps) {
  const router = useRouter()
  const [name, setName] = useState(parkingLot.name)
  const [location, setLocation] = useState(parkingLot.location)
  const [totalSpaces, setTotalSpaces] = useState(parkingLot.total_spaces.toString())
  const [hourlyRate, setHourlyRate] = useState(parkingLot.hourly_rate?.toString() || "")
  const [dailyRate, setDailyRate] = useState(parkingLot.daily_rate?.toString() || "")
  const [operatingHours, setOperatingHours] = useState(parkingLot.operating_hours || "")
  const [isCovered, setIsCovered] = useState(parkingLot.is_covered || false)
  const [hasEvCharging, setHasEvCharging] = useState(parkingLot.has_ev_charging || false)
  const [hasHandicapSpaces, setHasHandicapSpaces] = useState(parkingLot.has_handicap_spaces || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("location", location)
      formData.append("totalSpaces", totalSpaces)
      formData.append("hourlyRate", hourlyRate)
      if (dailyRate) formData.append("dailyRate", dailyRate)
      formData.append("operatingHours", operatingHours)
      if (isCovered) formData.append("isCovered", "on")
      if (hasEvCharging) formData.append("hasEvCharging", "on")
      if (hasHandicapSpaces) formData.append("hasHandicapSpaces", "on")

      await updateParkingLot(parkingLot.id, formData)
      toast({
        title: "Parking lot updated",
        description: "The parking lot has been updated successfully.",
      })
      router.push(`/parking-lots/${parkingLot.id}`)
    } catch (err) {
      console.error("Error updating parking lot:", err)
      setError("Failed to update parking lot. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Parking Lot</CardTitle>
        <CardDescription>Update the details for {parkingLot.name}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Parking Lot Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter parking lot name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalSpaces">Total Spaces *</Label>
              <Input
                id="totalSpaces"
                type="number"
                min={parkingLot.total_spaces.toString()}
                value={totalSpaces}
                onChange={(e) => setTotalSpaces(e.target.value)}
                placeholder="Enter total spaces"
                required
              />
              <p className="text-xs text-muted-foreground">
                Note: You can only increase the number of spaces, not decrease.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="Enter hourly rate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate ($)</Label>
              <Input
                id="dailyRate"
                type="number"
                min="0"
                step="0.01"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="Enter daily rate"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operatingHours">Operating Hours</Label>
            <Input
              id="operatingHours"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g., 24/7 or 8:00 AM - 10:00 PM"
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCovered"
                  checked={isCovered}
                  onCheckedChange={(checked) => setIsCovered(checked as boolean)}
                />
                <Label htmlFor="isCovered" className="font-normal">
                  Covered Parking
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEvCharging"
                  checked={hasEvCharging}
                  onCheckedChange={(checked) => setHasEvCharging(checked as boolean)}
                />
                <Label htmlFor="hasEvCharging" className="font-normal">
                  EV Charging
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasHandicapSpaces"
                  checked={hasHandicapSpaces}
                  onCheckedChange={(checked) => setHasHandicapSpaces(checked as boolean)}
                />
                <Label htmlFor="hasHandicapSpaces" className="font-normal">
                  Handicap Spaces
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" asChild>
            <Link href={`/parking-lots/${parkingLot.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Parking Lot"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
