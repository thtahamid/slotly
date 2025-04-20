import { getParkingLotById } from "@/app/actions/parking-lots"
import { EditParkingLotForm } from "@/components/forms/edit-parking-lot-form"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditParkingLotPage({ params }: { params: { id: string } }) {
  // Fetch the parking lot
  const parkingLot = await getParkingLotById(params.id).catch(() => null)

  if (!parkingLot) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader />
      <div className="container py-6">
        <div className="mb-6">
          <Link href={`/parking-lots/${params.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to {parkingLot.name}
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-2xl">
          <EditParkingLotForm parkingLot={parkingLot} />
        </div>
      </div>
    </main>
  )
}
