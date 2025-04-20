"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server-client"
import { redirect } from "next/navigation"

// Get all parking lots
export async function getParkingLots() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("parking_lots").select("*").order("name")

  if (error) {
    console.error("Error fetching parking lots:", error)
    throw new Error(`Failed to fetch parking lots: ${error.message}`)
  }

  return data
}

// Get a single parking lot by ID
export async function getParkingLotById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("parking_lots").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching parking lot ${id}:`, error)
    throw new Error(`Failed to fetch parking lot: ${error.message}`)
  }

  return data
}

// Create a new parking lot
export async function createParkingLot(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const totalSpaces = Number.parseInt(formData.get("totalSpaces") as string)
  const hourlyRate = Number.parseFloat(formData.get("hourlyRate") as string)
  const dailyRate = formData.get("dailyRate") ? Number.parseFloat(formData.get("dailyRate") as string) : null
  const operatingHours = (formData.get("operatingHours") as string) || "24/7"
  const isCovered = formData.get("isCovered") === "on"
  const hasEvCharging = formData.get("hasEvCharging") === "on"
  const hasHandicapSpaces = formData.get("hasHandicapSpaces") === "on"

  const newParkingLot = {
    name,
    location,
    total_spaces: totalSpaces,
    hourly_rate: hourlyRate,
    daily_rate: dailyRate,
    operating_hours: operatingHours,
    is_covered: isCovered,
    has_ev_charging: hasEvCharging,
    has_handicap_spaces: hasHandicapSpaces,
  }

  const { data, error } = await supabase.from("parking_lots").insert([newParkingLot]).select()

  if (error) {
    console.error("Error creating parking lot:", error)
    throw new Error(`Failed to create parking lot: ${error.message}`)
  }

  // After creating the parking lot, create the initial parking spaces
  if (data && data.length > 0) {
    const lotId = data[0].id

    // Create parking spaces based on total_spaces
    const parkingSpaces = []
    for (let i = 1; i <= totalSpaces; i++) {
      // Determine space type (make first 10% handicap, next 10% EV, rest standard)
      let spaceType = "standard"
      if (i <= Math.ceil(totalSpaces * 0.1)) {
        spaceType = "handicap"
      } else if (i <= Math.ceil(totalSpaces * 0.2)) {
        spaceType = "ev"
      }

      // Create space number (A1, A2, ... B1, B2, ...)
      const section = String.fromCharCode(65 + Math.floor((i - 1) / 50)) // A, B, C, ...
      const number = ((i - 1) % 50) + 1 // 1, 2, 3, ...
      const spaceNumber = `${section}${number}`

      parkingSpaces.push({
        lot_id: lotId,
        space_number: spaceNumber,
        space_type: spaceType,
        status: "available",
      })
    }

    // Insert all parking spaces
    const { error: spacesError } = await supabase.from("parking_spaces").insert(parkingSpaces)

    if (spacesError) {
      console.error("Error creating parking spaces:", spacesError)
      // We don't throw here because the parking lot was created successfully
    }
  }

  revalidatePath("/")
  redirect("/")
}

// Update a parking lot
export async function updateParkingLot(id: string, formData: FormData) {
  const supabase = createServerSupabaseClient()

  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const totalSpaces = Number.parseInt(formData.get("totalSpaces") as string)
  const hourlyRate = Number.parseFloat(formData.get("hourlyRate") as string)
  const dailyRate = formData.get("dailyRate") ? Number.parseFloat(formData.get("dailyRate") as string) : null
  const operatingHours = (formData.get("operatingHours") as string) || "24/7"
  const isCovered = formData.get("isCovered") === "on"
  const hasEvCharging = formData.get("hasEvCharging") === "on"
  const hasHandicapSpaces = formData.get("hasHandicapSpaces") === "on"

  // Get the current parking lot to check if total_spaces has changed
  const { data: currentLot, error: fetchError } = await supabase
    .from("parking_lots")
    .select("total_spaces")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error(`Error fetching parking lot ${id}:`, fetchError)
    throw new Error(`Failed to fetch parking lot: ${fetchError.message}`)
  }

  const updatedParkingLot = {
    name,
    location,
    total_spaces: totalSpaces,
    hourly_rate: hourlyRate,
    daily_rate: dailyRate,
    operating_hours: operatingHours,
    is_covered: isCovered,
    has_ev_charging: hasEvCharging,
    has_handicap_spaces: hasHandicapSpaces,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("parking_lots").update(updatedParkingLot).eq("id", id)

  if (error) {
    console.error(`Error updating parking lot ${id}:`, error)
    throw new Error(`Failed to update parking lot: ${error.message}`)
  }

  // If total_spaces has increased, add new parking spaces
  if (currentLot && totalSpaces > currentLot.total_spaces) {
    const additionalSpaces = totalSpaces - currentLot.total_spaces

    // Get the highest space number to continue from there
    const { data: existingSpaces, error: spacesError } = await supabase
      .from("parking_spaces")
      .select("space_number")
      .eq("lot_id", id)
      .order("space_number", { ascending: false })
      .limit(1)

    if (spacesError) {
      console.error("Error fetching existing spaces:", spacesError)
    } else {
      // Determine the starting index for new spaces
      const startIndex = currentLot.total_spaces + 1

      // Create new parking spaces
      const newParkingSpaces = []
      for (let i = 0; i < additionalSpaces; i++) {
        const spaceIndex = startIndex + i

        // Determine space type (make first 10% handicap, next 10% EV, rest standard)
        let spaceType = "standard"
        if (spaceIndex <= Math.ceil(totalSpaces * 0.1)) {
          spaceType = "handicap"
        } else if (spaceIndex <= Math.ceil(totalSpaces * 0.2)) {
          spaceType = "ev"
        }

        // Create space number (A1, A2, ... B1, B2, ...)
        const section = String.fromCharCode(65 + Math.floor((spaceIndex - 1) / 50)) // A, B, C, ...
        const number = ((spaceIndex - 1) % 50) + 1 // 1, 2, 3, ...
        const spaceNumber = `${section}${number}`

        newParkingSpaces.push({
          lot_id: id,
          space_number: spaceNumber,
          space_type: spaceType,
          status: "available",
        })
      }

      // Insert new parking spaces
      if (newParkingSpaces.length > 0) {
        const { error: insertError } = await supabase.from("parking_spaces").insert(newParkingSpaces)

        if (insertError) {
          console.error("Error creating additional parking spaces:", insertError)
        }
      }
    }
  }

  revalidatePath(`/parking-lots/${id}`)
  revalidatePath("/")
  redirect(`/parking-lots/${id}`)
}

// Delete a parking lot
export async function deleteParkingLot(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("parking_lots").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting parking lot ${id}:`, error)
    throw new Error(`Failed to delete parking lot: ${error.message}`)
  }

  revalidatePath("/")
  redirect("/")
}

// Get parking lot statistics
export async function getParkingLotStats(id: string) {
  const supabase = createServerSupabaseClient()

  // Get the parking lot
  const { data: parkingLot, error: lotError } = await supabase.from("parking_lots").select("*").eq("id", id).single()

  if (lotError) {
    console.error(`Error fetching parking lot ${id}:`, lotError)
    throw new Error(`Failed to fetch parking lot: ${lotError.message}`)
  }

  // Get parking spaces count by status
  const { data: spacesData, error: spacesError } = await supabase
    .from("parking_spaces")
    .select("status")
    .eq("lot_id", id)

  if (spacesError) {
    console.error(`Error fetching parking spaces for lot ${id}:`, spacesError)
    throw new Error(`Failed to fetch parking spaces: ${spacesError.message}`)
  }

  // Calculate occupancy statistics
  const totalSpaces = spacesData.length
  const occupiedSpaces = spacesData.filter((space) => space.status === "occupied").length
  const availableSpaces = spacesData.filter((space) => space.status === "available").length
  const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0

  // Get today's revenue
  const today = new Date().toISOString().split("T")[0]
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("parking_sessions")
    .select("total_cost")
    .eq("parking_space_id", id)
    .gte("start_time", `${today}T00:00:00`)
    .lte("start_time", `${today}T23:59:59`)

  if (sessionsError) {
    console.error(`Error fetching parking sessions for lot ${id}:`, sessionsError)
    throw new Error(`Failed to fetch parking sessions: ${sessionsError.message}`)
  }

  // Calculate revenue
  const dailyRevenue = sessionsData.reduce((sum, session) => sum + (session.total_cost || 0), 0)

  return {
    parkingLot,
    totalSpaces,
    occupiedSpaces,
    availableSpaces,
    occupancyRate,
    dailyRevenue,
  }
}
