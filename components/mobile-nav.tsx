"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Skip rendering on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-xl px-0 py-6">
        <div className="flex h-full flex-col">
          <div className="px-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <p className="text-sm text-muted-foreground">Navigate to different sections</p>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-2 px-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/reports"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/reports" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <BarChart className="h-5 w-5" />
              Reports
            </Link>
          </nav>
          <div className="mt-auto px-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Close Menu
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
