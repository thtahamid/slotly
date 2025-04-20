"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createParkingLot } from "@/app/actions/parking-lots"

export default function AddParkingLotPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [totalSpaces, setTotalSpaces] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [dailyRate, setDailyRate] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [isCovered, setIsCovered] = useState(false)
  const [hasEvCharging, setHasEvCharging] = useState(false)
  const [hasHandicapSpaces, setHasHandicapSpaces] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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

      await createParkingLot(formData)
      router.push("/")
    } catch (error) {
      console.error("Error creating parking lot:", error)
      setIsSubmitting(false)
    }
  }

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

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Add New Parking Lot</CardTitle>
              <CardDescription>Create a new parking lot to manage in the system</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                      min="1"
                      value={totalSpaces}
                      onChange={(e) => setTotalSpaces(e.target.value)}
                      placeholder="Enter total spaces"
                      required
                    />
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
                  <Link href="/">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Parking Lot"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </main>
  )
}
