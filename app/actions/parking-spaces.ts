"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server-client"
import { redirect } from "next/navigation"

// Get all parking spaces for a specific lot
export async function getParkingSpaces(lotId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("parking_spaces").select("*").eq("lot_id", lotId).order("space_number")

  if (error) {
    console.error(`Error fetching parking spaces for lot ${lotId}:`, error)
    throw new Error(`Failed to fetch parking spaces: ${error.message}`)
  }

  return data
}

// Get a single parking space by ID
export async function getParkingSpaceById(spaceId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("parking_spaces").select("*").eq("id", spaceId).single()

  if (error) {
    console.error(`Error fetching parking space ${spaceId}:`, error)
    throw new Error(`Failed to fetch parking space: ${error.message}`)
  }

  return data
}

// Update a parking space status
export async function updateParkingSpaceStatus(spaceId: string, status: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("parking_spaces")
    .update({ status, last_updated: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", spaceId)
    .select()

  if (error) {
    console.error(`Error updating parking space ${spaceId}:`, error)
    throw new Error(`Failed to update parking space: ${error.message}`)
  }

  // Get the lot_id to redirect back to the lot page
  const lotId = data[0].lot_id

  revalidatePath(`/parking-lots/${lotId}`)
  return data[0]
}

// Check in a vehicle to a parking space
export async function checkInVehicle(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const spaceId = formData.get("spaceId") as string
  const lotId = formData.get("lotId") as string
  const licensePlate = formData.get("licensePlate") as string
  const vehicleType = formData.get("vehicleType") as string
  const customerName = formData.get("customerName") as string
  const customerPhone = formData.get("customerPhone") as string
  const notes = formData.get("notes") as string

  // Start a transaction
  // 1. Update the parking space status to occupied
  const { data: spaceData, error: spaceError } = await supabase
    .from("parking_spaces")
    .update({ status: "occupied", last_updated: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", spaceId)
    .select()

  if (spaceError) {
    console.error(`Error updating parking space ${spaceId}:`, spaceError)
    throw new Error(`Failed to update parking space: ${spaceError.message}`)
  }

  // 2. Create a new parking session
  const { data: sessionData, error: sessionError } = await supabase
    .from("parking_sessions")
    .insert([
      {
        parking_space_id: spaceId,
        start_time: new Date().toISOString(),
        payment_status: "pending",
        vehicle_license_plate: licensePlate,
        vehicle_type: vehicleType,
        notes: notes,
      },
    ])
    .select()

  if (sessionError) {
    console.error("Error creating parking session:", sessionError)
    // If there's an error creating the session, revert the space status
    await supabase
      .from("parking_spaces")
      .update({ status: "available", last_updated: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", spaceId)
    throw new Error(`Failed to create parking session: ${sessionError.message}`)
  }

  // 3. If customer info is provided, check if user exists or create a new one
  if (customerName && customerPhone) {
    // Check if user exists with this phone number
    const { data: existingUser, error: userQueryError } = await supabase
      .from("users")
      .select("id")
      .eq("phone", customerPhone)
      .maybeSingle()

    if (userQueryError) {
      console.error("Error querying user:", userQueryError)
      // Don't throw here, just log the error
    }

    let userId = existingUser?.id

    // If user doesn't exist, create a new one
    if (!userId) {
      const { data: newUser, error: userCreateError } = await supabase
        .from("users")
        .insert([
          {
            name: customerName,
            email: `${customerPhone}@example.com`, // Placeholder email
            phone: customerPhone,
            license_plate: licensePlate,
          },
        ])
        .select()

      if (userCreateError) {
        console.error("Error creating user:", userCreateError)
        // Don't throw here, just log the error
      } else {
        userId = newUser[0].id
      }
    }

    // If we have a user ID, update the parking session
    if (userId) {
      const { error: updateSessionError } = await supabase
        .from("parking_sessions")
        .update({ user_id: userId })
        .eq("id", sessionData[0].id)

      if (updateSessionError) {
        console.error("Error updating parking session with user ID:", updateSessionError)
        // Don't throw here, just log the error
      }
    }
  }

  revalidatePath(`/parking-lots/${lotId}`)
  redirect(`/parking-lots/${lotId}`)
}

// Check out a vehicle from a parking space
export async function checkOutVehicle(sessionId: string) {
  const supabase = createServerSupabaseClient()

  // 1. Get the parking session
  const { data: session, error: sessionError } = await supabase
    .from("parking_sessions")
    .select("*, parking_spaces(lot_id)")
    .eq("id", sessionId)
    .single()

  if (sessionError) {
    console.error(`Error fetching parking session ${sessionId}:`, sessionError)
    throw new Error(`Failed to fetch parking session: ${sessionError.message}`)
  }

  // 2. Get the parking lot to calculate the fee
  const { data: parkingLot, error: lotError } = await supabase
    .from("parking_lots")
    .select("hourly_rate, daily_rate")
    .eq("id", session.parking_spaces.lot_id)
    .single()

  if (lotError) {
    console.error(`Error fetching parking lot:`, lotError)
    throw new Error(`Failed to fetch parking lot: ${lotError.message}`)
  }

  // 3. Calculate the fee
  const startTime = new Date(session.start_time).getTime()
  const endTime = new Date().getTime()
  const durationMs = endTime - startTime
  const durationHours = durationMs / (1000 * 60 * 60)

  let totalCost = 0
  if (parkingLot.daily_rate && durationHours >= 24) {
    // If parked for more than 24 hours and daily rate exists, use daily rate
    const days = Math.ceil(durationHours / 24)
    totalCost = days * parkingLot.daily_rate
  } else {
    // Otherwise use hourly rate
    totalCost = durationHours * parkingLot.hourly_rate
  }

  // Round to 2 decimal places
  totalCost = Math.round(totalCost * 100) / 100

  // 4. Update the parking session
  const { error: updateSessionError } = await supabase
    .from("parking_sessions")
    .update({
      end_time: new Date().toISOString(),
      total_cost: totalCost,
      payment_status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)

  if (updateSessionError) {
    console.error(`Error updating parking session ${sessionId}:`, updateSessionError)
    throw new Error(`Failed to update parking session: ${updateSessionError.message}`)
  }

  // 5. Update the parking space status
  const { error: updateSpaceError } = await supabase
    .from("parking_spaces")
    .update({
      status: "available",
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.parking_space_id)

  if (updateSpaceError) {
    console.error(`Error updating parking space:`, updateSpaceError)
    throw new Error(`Failed to update parking space: ${updateSpaceError.message}`)
  }

  revalidatePath(`/parking-lots/${session.parking_spaces.lot_id}`)
  return { success: true, lotId: session.parking_spaces.lot_id }
}

// Get active parking session for a space
export async function getActiveParkingSession(spaceId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("parking_sessions")
    .select("*")
    .eq("parking_space_id", spaceId)
    .is("end_time", null)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for "no rows returned"
    console.error(`Error fetching active parking session for space ${spaceId}:`, error)
    throw new Error(`Failed to fetch active parking session: ${error.message}`)
  }

  return data
}
