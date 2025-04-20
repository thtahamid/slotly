"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server-client"
import { revalidatePath } from "next/cache"

// Get revenue reports for a specific lot and date range
export async function getRevenueReports(lotId: string, startDate: string, endDate: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("revenue_reports")
    .select("*")
    .eq("lot_id", lotId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date")

  if (error) {
    console.error(`Error fetching revenue reports for lot ${lotId}:`, error)
    throw new Error(`Failed to fetch revenue reports: ${error.message}`)
  }

  return data
}

// Generate a revenue report for a specific lot and date
export async function generateRevenueReport(lotId: string, reportDate: string) {
  const supabase = createServerSupabaseClient()

  // Get the parking lot
  const { data: parkingLot, error: lotError } = await supabase.from("parking_lots").select("*").eq("id", lotId).single()

  if (lotError) {
    console.error(`Error fetching parking lot ${lotId}:`, lotError)
    throw new Error(`Failed to fetch parking lot: ${lotError.message}`)
  }

  // Get all parking spaces for this lot
  const { data: spaces, error: spacesError } = await supabase.from("parking_spaces").select("*").eq("lot_id", lotId)

  if (spacesError) {
    console.error(`Error fetching parking spaces for lot ${lotId}:`, spacesError)
    throw new Error(`Failed to fetch parking spaces: ${spacesError.message}`)
  }

  // Get all parking sessions for this lot on the specified date
  const { data: sessions, error: sessionsError } = await supabase
    .from("parking_sessions")
    .select("*, parking_spaces!inner(lot_id)")
    .eq("parking_spaces.lot_id", lotId)
    .gte("start_time", `${reportDate}T00:00:00`)
    .lte("start_time", `${reportDate}T23:59:59`)

  if (sessionsError) {
    console.error(`Error fetching parking sessions for lot ${lotId}:`, sessionsError)
    throw new Error(`Failed to fetch parking sessions: ${sessionsError.message}`)
  }

  // Calculate daily revenue
  const dailyRevenue = sessions.reduce((sum, session) => sum + (session.total_cost || 0), 0)

  // Calculate occupied spaces percentage
  const occupiedSpacesCount = new Set(sessions.map((session) => session.parking_space_id)).size
  const occupiedSpacesPercentage = spaces.length > 0 ? (occupiedSpacesCount / spaces.length) * 100 : 0

  // Calculate peak hour
  const hourCounts: Record<string, number> = {}
  sessions.forEach((session) => {
    const hour = new Date(session.start_time).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  let peakHour = "N/A"
  let maxCount = 0
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count
      peakHour = `${hour}:00 - ${hour}:59`
    }
  }

  // Calculate average session duration
  let totalDuration = 0
  let completedSessions = 0
  for (const session of sessions) {
    if (session.start_time && session.end_time) {
      const startTime = new Date(session.start_time).getTime()
      const endTime = new Date(session.end_time).getTime()
      totalDuration += endTime - startTime
      completedSessions++
    }
  }

  const avgSessionDuration = completedSessions > 0 ? totalDuration / completedSessions : 0
  const avgDurationHours = Math.floor(avgSessionDuration / (1000 * 60 * 60))
  const avgDurationMinutes = Math.floor((avgSessionDuration % (1000 * 60 * 60)) / (1000 * 60))
  const avgDurationFormatted = `${avgDurationHours}:${avgDurationMinutes.toString().padStart(2, "0")}`

  // Create or update the revenue report
  const { data: existingReport, error: reportError } = await supabase
    .from("revenue_reports")
    .select("id")
    .eq("lot_id", lotId)
    .eq("report_date", reportDate)
    .maybeSingle()

  if (reportError) {
    console.error(`Error checking existing report for lot ${lotId}:`, reportError)
    throw new Error(`Failed to check existing report: ${reportError.message}`)
  }

  const reportData = {
    lot_id: lotId,
    report_date: reportDate,
    daily_revenue: dailyRevenue,
    occupied_spaces_percentage: occupiedSpacesPercentage,
    peak_hour: peakHour,
    total_sessions: sessions.length,
    avg_session_duration: avgDurationFormatted,
  }

  if (existingReport) {
    // Update existing report
    const { error: updateError } = await supabase.from("revenue_reports").update(reportData).eq("id", existingReport.id)

    if (updateError) {
      console.error(`Error updating revenue report for lot ${lotId}:`, updateError)
      throw new Error(`Failed to update revenue report: ${updateError.message}`)
    }
  } else {
    // Create new report
    const { error: insertError } = await supabase.from("revenue_reports").insert([reportData])

    if (insertError) {
      console.error(`Error creating revenue report for lot ${lotId}:`, insertError)
      throw new Error(`Failed to create revenue report: ${insertError.message}`)
    }
  }

  revalidatePath("/reports")
  return true
}
