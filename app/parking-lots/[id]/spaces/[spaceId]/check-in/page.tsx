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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { checkInVehicle } from "@/app/actions/parking-spaces"

interface CheckInPageProps {
  params: {
    id: string
    spaceId: string
  }
  searchParams: {
    lotName?: string
    spaceNumber?: string
    hourlyRate?: string
  }
}

export default function CheckInPage({ params, searchParams }: CheckInPageProps) {
  const router = useRouter()
  const [licensePlate, setLicensePlate] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const lotName = searchParams.lotName || "Parking Lot"
  const spaceNumber = searchParams.spaceNumber || "Unknown"
  const hourlyRate = Number.parseFloat(searchParams.hourlyRate || "0")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("spaceId", params.spaceId)
      formData.append("lotId", params.id)
      formData.append("licensePlate", licensePlate)
      formData.append("vehicleType", vehicleType)
      formData.append("customerName", customerName)
      formData.append("customerPhone", customerPhone)
      formData.append("notes", notes)

      await checkInVehicle(formData)
      router.push(`/parking-lots/${params.id}`)
    } catch (error) {
      console.error("Error checking in vehicle:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader />
      <div className="container py-6">
        <div className="mb-6">
          <Link href={`/parking-lots/${params.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to {lotName}
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Check-In Vehicle</CardTitle>
              <CardDescription>
                Space {spaceNumber} at {lotName}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate *</Label>
                  <Input
                    id="licensePlate"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="Enter license plate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType} required>
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional notes"
                  />
                </div>

                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Hourly Rate:</span>
                    <span className="font-medium">{formatCurrency(hourlyRate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Check-in Time:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/parking-lots/${params.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Check In Vehicle"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </main>
  )
}
