import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Parking Lots
export async function getParkingLots() {
  const { data, error } = await supabase.from("parking_lots").select("*").order("name")

  if (error) {
    console.error("Error fetching parking lots:", error)
    return []
  }

  return data
}

export async function getParkingLot(id: string) {
  const { data, error } = await supabase.from("parking_lots").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching parking lot ${id}:`, error)
    return null
  }

  return data
}

export async function createParkingLot(parkingLot: any) {
  const { data, error } = await supabase.from("parking_lots").insert([parkingLot]).select()

  if (error) {
    console.error("Error creating parking lot:", error)
    throw error
  }

  return data[0]
}

// Parking Spaces
export async function getParkingSpaces(lotId: string) {
  const { data, error } = await supabase.from("parking_spaces").select("*").eq("lot_id", lotId).order("space_number")

  if (error) {
    console.error(`Error fetching parking spaces for lot ${lotId}:`, error)
    return []
  }

  return data
}

export async function getParkingSpace(spaceId: string) {
  const { data, error } = await supabase.from("parking_spaces").select("*").eq("id", spaceId).single()

  if (error) {
    console.error(`Error fetching parking space ${spaceId}:`, error)
    return null
  }

  return data
}

export async function updateParkingSpaceStatus(spaceId: string, status: string) {
  const { data, error } = await supabase
    .from("parking_spaces")
    .update({ status, last_updated: new Date().toISOString() })
    .eq("id", spaceId)
    .select()

  if (error) {
    console.error(`Error updating parking space ${spaceId}:`, error)
    throw error
  }

  return data[0]
}

// Parking Sessions
export async function createParkingSession(session: any) {
  const { data, error } = await supabase.from("parking_sessions").insert([session]).select()

  if (error) {
    console.error("Error creating parking session:", error)
    throw error
  }

  return data[0]
}

export async function endParkingSession(sessionId: string, endTime: string, totalCost: number) {
  const { data, error } = await supabase
    .from("parking_sessions")
    .update({
      end_time: endTime,
      total_cost: totalCost,
      payment_status: "completed",
    })
    .eq("id", sessionId)
    .select()

  if (error) {
    console.error(`Error ending parking session ${sessionId}:`, error)
    throw error
  }

  return data[0]
}

// Revenue Reports
export async function getRevenueReports(lotId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("revenue_reports")
    .select("*")
    .eq("lot_id", lotId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date")

  if (error) {
    console.error(`Error fetching revenue reports for lot ${lotId}:`, error)
    return []
  }

  return data
}
