"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ParkingLot } from "@/types/supabase"

interface ReportFiltersProps {
  parkingLots: ParkingLot[]
}

export function ReportFilters({ parkingLots }: ReportFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [lotId, setLotId] = useState(searchParams.get("lotId") || (parkingLots.length > 0 ? parkingLots[0].id : ""))
  const [period, setPeriod] = useState(searchParams.get("period") || "week")
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : new Date(),
  )

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    if (lotId) params.set("lotId", lotId)
    else params.delete("lotId")

    if (period) params.set("period", period)
    else params.delete("period")

    if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"))
    else params.delete("startDate")

    if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"))
    else params.delete("endDate")

    router.push(`${pathname}?${params.toString()}`)
  }, [lotId, period, startDate, endDate, pathname, router, searchParams])

  // Set date range based on period
  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    const today = new Date()

    if (value === "week") {
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)
      setStartDate(lastWeek)
      setEndDate(today)
    } else if (value === "month") {
      const lastMonth = new Date(today)
      lastMonth.setMonth(today.getMonth() - 1)
      setStartDate(lastMonth)
      setEndDate(today)
    } else if (value === "year") {
      const lastYear = new Date(today)
      lastYear.setFullYear(today.getFullYear() - 1)
      setStartDate(lastYear)
      setEndDate(today)
    }
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="parkingLot">Parking Lot</Label>
          <Select value={lotId} onValueChange={setLotId}>
            <SelectTrigger id="parkingLot">
              <SelectValue placeholder="Select parking lot" />
            </SelectTrigger>
            <SelectContent>
              {parkingLots.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Time Period</Label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger id="period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last 365 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}
