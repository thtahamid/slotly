"use client"

import Link from "next/link"
import { Car, Clock, Ban, Wrench } from "lucide-react"
import { useState, useEffect } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { checkOutVehicle, getActiveParkingSession } from "@/app/actions/parking-spaces"
import { useRouter } from "next/navigation"
import { useRealtime } from "@/contexts/realtime-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Vehicle {
  licensePlate: string
  type: string
}

interface ParkingSpace {
  id: string
  spaceNumber: string
  status: "available" | "occupied" | "reserved" | "maintenance"
  spaceType: string
  vehicle?: Vehicle
  checkInTime?: string
  duration?: number
  fee?: number
}

interface ParkingSpaceTableProps {
  parkingLotId: string
  spaces: ParkingSpace[]
}

export function ParkingSpaceTable({ parkingLotId, spaces }: ParkingSpaceTableProps) {
  const router = useRouter()
  const { parkingSpaceUpdates } = useRealtime()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSpaceId, setCheckoutSpaceId] = useState<string | null>(null)
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [localSpaces, setLocalSpaces] = useState<ParkingSpace[]>(spaces)

  // Update local spaces when props change
  useEffect(() => {
    setLocalSpaces(spaces)
  }, [spaces])

  // Update local spaces when real-time updates are received
  useEffect(() => {
    if (Object.keys(parkingSpaceUpdates).length > 0) {
      setLocalSpaces((currentSpaces) => {
        return currentSpaces.map((space) => {
          const update = parkingSpaceUpdates[space.id]
          if (update) {
            return {
              ...space,
              status: update.status,
            }
          }
          return space
        })
      })
    }
  }, [parkingSpaceUpdates])

  const handleCheckOutClick = async (spaceId: string) => {
    setIsLoading((prev) => ({ ...prev, [spaceId]: true }))
    try {
      // Get the active session for this space
      const session = await getActiveParkingSession(spaceId)
      if (session) {
        setCheckoutSpaceId(spaceId)
        setCheckoutSessionId(session.id)
        setIsCheckingOut(true)
      } else {
        console.error("No active session found for this space")
      }
    } catch (error) {
      console.error("Error getting active session:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, [spaceId]: false }))
    }
  }

  const handleCheckOut = async () => {
    if (!checkoutSessionId) return

    setIsLoading((prev) => ({ ...prev, [checkoutSpaceId!]: true }))
    try {
      const result = await checkOutVehicle(checkoutSessionId)
      if (result.success) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error checking out vehicle:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, [checkoutSpaceId!]: false }))
      setIsCheckingOut(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Space</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localSpaces.map((space) => (
              <TableRow key={space.id}>
                <TableCell className="font-medium">{space.spaceNumber}</TableCell>
                <TableCell>
                  {space.spaceType === "handicap" ? (
                    <Badge variant="outline" className="bg-info-light text-info-dark">
                      Handicap
                    </Badge>
                  ) : space.spaceType === "ev" ? (
                    <Badge variant="outline" className="bg-success-light text-success-dark">
                      EV
                    </Badge>
                  ) : (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {space.status === "available" ? (
                    <Badge variant="outline" className="bg-success-light text-success-dark">
                      <Ban className="mr-1 h-3 w-3" />
                      Available
                    </Badge>
                  ) : space.status === "occupied" ? (
                    <Badge variant="outline" className="bg-danger-light text-danger-dark">
                      <Car className="mr-1 h-3 w-3" />
                      Occupied
                    </Badge>
                  ) : space.status === "reserved" ? (
                    <Badge variant="outline" className="bg-warning-light text-warning-dark">
                      <Clock className="mr-1 h-3 w-3" />
                      Reserved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      <Wrench className="mr-1 h-3 w-3" />
                      Maintenance
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {space.vehicle ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{space.vehicle.licensePlate}</span>
                      <span className="text-xs text-muted-foreground">{space.vehicle.type}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {space.checkInTime ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{space.checkInTime}</span>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {space.duration} min
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{space.fee ? formatCurrency(space.fee) : "-"}</TableCell>
                <TableCell className="text-right">
                  {space.status === "available" ? (
                    <Link href={`/parking-lots/${parkingLotId}/spaces/${space.id}/check-in`}>
                      <Button size="sm" variant="outline" className="h-8">
                        Check In
                      </Button>
                    </Link>
                  ) : space.status === "occupied" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-danger-light text-danger hover:bg-danger hover:text-white"
                      onClick={() => handleCheckOutClick(space.id)}
                      disabled={isLoading[space.id]}
                    >
                      {isLoading[space.id] ? "Processing..." : "Check Out"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8" disabled>
                      {space.status === "reserved" ? "Reserved" : "Maintenance"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isCheckingOut} onOpenChange={setIsCheckingOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check Out Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check out this vehicle? The payment will be processed and the space will be
              marked as available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckOut}>Check Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
