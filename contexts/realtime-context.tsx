"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

type RealtimeContextType = {
  parkingSpaceUpdates: Record<string, any>
  parkingLotUpdates: Record<string, any>
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [parkingSpaceUpdates, setParkingSpaceUpdates] = useState<Record<string, any>>({})
  const [parkingLotUpdates, setParkingLotUpdates] = useState<Record<string, any>>({})
  const { toast } = useToast()

  useEffect(() => {
    // Subscribe to parking spaces changes
    const spacesSubscription = supabaseClient
      .channel("parking_spaces_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parking_spaces",
        },
        (payload) => {
          console.log("Parking space change received:", payload)
          setParkingSpaceUpdates((prev) => ({
            ...prev,
            [payload.new.id]: payload.new,
          }))

          // Show toast notification for status changes
          if (payload.eventType === "UPDATE" && payload.old.status !== payload.new.status) {
            toast({
              title: "Parking Space Updated",
              description: `Space ${payload.new.space_number} is now ${payload.new.status}`,
            })
          }
        },
      )
      .subscribe()

    // Subscribe to parking lots changes
    const lotsSubscription = supabaseClient
      .channel("parking_lots_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parking_lots",
        },
        (payload) => {
          console.log("Parking lot change received:", payload)
          setParkingLotUpdates((prev) => ({
            ...prev,
            [payload.new.id]: payload.new,
          }))

          // Show toast notification for new parking lots
          if (payload.eventType === "INSERT") {
            toast({
              title: "New Parking Lot Added",
              description: `${payload.new.name} has been added`,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(spacesSubscription)
      supabaseClient.removeChannel(lotsSubscription)
    }
  }, [toast])

  return (
    <RealtimeContext.Provider
      value={{
        parkingSpaceUpdates,
        parkingLotUpdates,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}
