"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader } from "@/components/ui/loader"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, company, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
  }

  const handleHistoryClick = () => {
    if (user?.role === "employee") {
      router.push("/dashboard/employee")
    } else if (user?.role === "manager") {
      router.push("/dashboard/manager")
    } else if (user?.role === "admin") {
      router.push("/dashboard/admin")
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="sticky top-0 z-50 border-b border-cyan-200/50 bg-white/90 backdrop-blur-xl shadow-xl animate-slide-in">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
              <div className="relative h-12 w-12 rounded-3xl bg-gradient-to-br from-blue-900 via-cyan-500 to-lime-400 p-1 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-110 animate-bounce-subtle">
                <div className="relative h-full w-full rounded-3xl bg-white p-1">
                  <Image src="/logo.png" alt="Expentia" fill className="object-contain" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-cyan-500 to-lime-500 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 inline-block">
                  Expentia
                </span>
                <p className="text-xs text-gray-600 hidden sm:block font-medium">{company?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-3 px-5 py-3 rounded-3xl bg-gradient-to-r from-cyan-50 to-lime-50 border-2 border-cyan-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center shadow-lg ring-2 ring-cyan-200 ring-offset-2">
                    <span className="text-sm font-bold text-white">{user?.name.charAt(0).toUpperCase()}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-3xl border-2 border-cyan-200 shadow-xl">
                <DropdownMenuLabel className="font-semibold text-gray-900">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cyan-200" />
                <DropdownMenuItem
                  onClick={handleProfileClick}
                  className="cursor-pointer rounded-2xl hover:bg-cyan-50 focus:bg-cyan-50"
                >
                  <User className="mr-2 h-4 w-4 text-cyan-600" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleHistoryClick}
                  className="cursor-pointer rounded-2xl hover:bg-lime-50 focus:bg-lime-50"
                >
                  <History className="mr-2 h-4 w-4 text-lime-600" />
                  <span className="font-medium">History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-2xl hover:bg-red-50 focus:bg-red-50 text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden gap-2 bg-white hover:bg-cyan-50 border-2 border-cyan-200 hover:border-cyan-300 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-3xl border-2 border-cyan-200 shadow-xl">
                <DropdownMenuLabel className="font-semibold text-gray-900">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cyan-200" />
                <DropdownMenuItem
                  onClick={handleProfileClick}
                  className="cursor-pointer rounded-2xl hover:bg-cyan-50 focus:bg-cyan-50"
                >
                  <User className="mr-2 h-4 w-4 text-cyan-600" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleHistoryClick}
                  className="cursor-pointer rounded-2xl hover:bg-lime-50 focus:bg-lime-50"
                >
                  <History className="mr-2 h-4 w-4 text-lime-600" />
                  <span className="font-medium">History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-2xl hover:bg-red-50 focus:bg-red-50 text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-5xl font-bold mb-3 text-balance bg-gradient-to-r from-blue-900 via-cyan-500 to-lime-500 bg-clip-text text-transparent drop-shadow-sm">
            {title}
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-500 via-teal-400 to-lime-500 rounded-full shadow-lg" />
        </div>
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}