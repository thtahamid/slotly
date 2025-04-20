"use client"

import { PlusCircle, LogOut, User, BarChart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.user_metadata?.name) return "U"
    return user.user_metadata.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="border-b bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end dark:bg-none dark:bg-gray-900">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-2 font-semibold text-white dark:text-white">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-9GD7zdxO8gALexSlBp6qnmR3wBhru1.png"
              alt="Slotly Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg">Slotly</span>
          </Link>
        </div>

        <div className="ml-8 hidden md:flex">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-white/80 ${
                pathname === "/" ? "text-white" : "text-white/60"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/reports"
              className={`text-sm font-medium transition-colors hover:text-white/80 ${
                pathname === "/reports" ? "text-white" : "text-white/60"
              }`}
            >
              Reports
            </Link>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/reports" className="md:hidden">
            <Button size="sm" variant="ghost" className="h-8 text-white hover:bg-white/10 hover:text-white">
              <BarChart className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/parking-lots/new">
            <Button
              size="sm"
              className="h-8 gap-1 bg-white text-primary-gradient-start hover:bg-white/90 dark:bg-primary dark:text-primary-foreground"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline-flex">Add Parking Lot</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary-gradient-start text-white">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
