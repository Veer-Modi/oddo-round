"use client"

import { Receipt, DollarSign, TrendingUp } from "lucide-react"
import Image from "next/image"

export function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      <div className="relative">
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring - Cyan */}
          <div
            className="absolute h-32 w-32 rounded-full border-4 border-cyan-300 animate-spin"
            style={{ animationDuration: "3s" }}
          />

          {/* Middle rotating ring - Lime Green */}
          <div
            className="absolute h-24 w-24 rounded-full border-4 border-lime-400 animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          />

          {/* Inner pulsing circle - Navy to Cyan gradient */}
          <div className="absolute h-16 w-16 rounded-full bg-gradient-to-br from-blue-900 via-cyan-500 to-lime-400 animate-pulse shadow-2xl" />

          {/* Center logo */}
          <div className="relative z-10 h-10 w-10">
            <Image src="/logo.png" alt="Expentia" fill className="object-contain animate-pulse" />
          </div>
        </div>

        {/* Floating icons with logo colors */}
        <div className="absolute -top-8 -left-8 animate-float">
          <div className="rounded-full bg-cyan-100 p-3 shadow-lg">
            <Receipt className="h-5 w-5 text-cyan-600" />
          </div>
        </div>

        <div className="absolute -top-8 -right-8 animate-float" style={{ animationDelay: "1s" }}>
          <div className="rounded-full bg-lime-100 p-3 shadow-lg">
            <DollarSign className="h-5 w-5 text-lime-600" />
          </div>
        </div>

        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: "2s" }}>
          <div className="rounded-full bg-blue-100 p-3 shadow-lg">
            <TrendingUp className="h-5 w-5 text-blue-900" />
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-lg font-bold bg-gradient-to-r from-blue-900 via-cyan-500 to-lime-500 bg-clip-text text-transparent animate-pulse">
            Loading Expentia...
          </p>
        </div>
      </div>
    </div>
  )
}
