"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Company, AuthContextType, UserRole } from "@/lib/types"
import { db, initializeDatabase } from "@/lib/db"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize database with dummy data
    initializeDatabase()

    // Check for existing session
    const currentUser = db.auth.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      const userCompany = db.companies.getById(currentUser.companyId)
      setCompany(userCompany)
    }
    setIsInitialized(true)
  }, [])

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const foundUser = db.users.getByEmail(email)

    if (!foundUser || foundUser.password !== password || foundUser.role !== role) {
      return false
    }

    const userCompany = db.companies.getById(foundUser.companyId)
    setUser(foundUser)
    setCompany(userCompany)
    db.auth.setCurrentUser(foundUser)
    return true
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    companyName: string,
    countryCode: string,
  ): Promise<boolean> => {
    // Check if user already exists
    const existingUser = db.users.getByEmail(email)
    if (existingUser) {
      return false
    }

    // Get currency for country
    const countries = await import("@/lib/currency").then((m) => m.fetchCountries())
    const country = (await countries).find((c) => c.name.common.toLowerCase().includes(countryCode.toLowerCase()))
    const currency = country && country.currencies ? Object.keys(country.currencies)[0] : "USD"

    // Create company
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: companyName,
      currency,
      countryCode,
      createdAt: new Date().toISOString(),
    }
    db.companies.create(newCompany)

    // Create admin user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: "admin",
      companyId: newCompany.id,
      createdAt: new Date().toISOString(),
    }
    db.users.create(newUser)

    setUser(newUser)
    setCompany(newCompany)
    db.auth.setCurrentUser(newUser)
    return true
  }

  const logout = () => {
    setUser(null)
    setCompany(null)
    db.auth.setCurrentUser(null)
  }

  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
