import { type NextRequest, NextResponse } from "next/server"
import { deleteParkingLot } from "@/app/actions/parking-lots"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteParkingLot(params.id)
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Error deleting parking lot:", error)
    return NextResponse.json({ error: "Failed to delete parking lot" }, { status: 500 })
  }
}
