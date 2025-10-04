"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserRole } from "@/lib/types"
import { Building2, User, Users, AlertCircle, Sparkles, Receipt, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const roles = [
        {
            value: "admin" as UserRole,
            label: "Admin",
            description: "Manage users and approval rules",
            icon: Building2,
            demoEmail: "admin@acme.com",
            gradient: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-500/10 to-purple-600/10",
        },
        {
            value: "manager" as UserRole,
            label: "Manager",
            description: "Approve team expenses",
            icon: Users,
            demoEmail: "manager@acme.com",
            gradient: "from-cyan-500 to-blue-500",
            bgGradient: "from-cyan-500/10 to-blue-500/10",
        },
        {
            value: "employee" as UserRole,
            label: "Employee",
            description: "Submit expense claims",
            icon: User,
            demoEmail: "employee@acme.com",
            gradient: "from-orange-500 to-pink-500",
            bgGradient: "from-orange-500/10 to-pink-500/10",
        },
    ]

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role)
        setError("")
        const selectedRoleData = roles.find((r) => r.value === role)
        if (selectedRoleData) {
            setEmail(selectedRoleData.demoEmail)
            setPassword(`${role}123`)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRole) {
            setError("Please select a role")
            return
        }

        setIsLoading(true)
        setError("")

        const success = await login(email, password, selectedRole)

        if (success) {
            router.push(`/dashboard/${selectedRole}`)
        } else {
            setError("Invalid credentials or role mismatch")
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center gradient-bg p-4 overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-float" />
            <div
                className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "2s" }}
            />
            <div
                className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "4s" }}
            />

            {/* Expense-related floating icons */}
            <div className="absolute top-32 right-1/4 animate-float opacity-10">
                <Receipt className="w-16 h-16 text-purple-600" />
            </div>
            <div className="absolute bottom-32 left-1/4 animate-float opacity-10" style={{ animationDelay: "1s" }}>
                <TrendingUp className="w-20 h-20 text-cyan-600" />
            </div>

            <Card className="relative w-full max-w-2xl border-0 shadow-2xl backdrop-blur-sm bg-white/95 animate-scale-in">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center mb-4 shadow-2xl animate-pulse-slow">
                        <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent animate-fade-in">
                        Expentia
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 animate-fade-in">
                        Experience seamless expense management
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!selectedRole ? (
                        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
                            {roles.map((role, index) => {
                                const Icon = role.icon
                                return (
                                    <button
                                        key={role.value}
                                        onClick={() => handleRoleSelect(role.value)}
                                        className={`group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-gradient-to-br ${role.bgGradient} p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-300 animate-slide-up`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div
                                            className={`rounded-2xl bg-gradient-to-br ${role.gradient} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{role.label}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5 animate-slide-up">
                            <div
                                className={`flex items-center justify-between rounded-2xl bg-gradient-to-r ${roles.find((r) => r.value === selectedRole)?.bgGradient} p-5 border-2 border-purple-200`}
                            >
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const roleData = roles.find((r) => r.value === selectedRole)
                                        const Icon = roleData?.icon || User
                                        return (
                                            <div className={`rounded-xl bg-gradient-to-br ${roleData?.gradient} p-3 shadow-md`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                        )
                                    })()}
                                    <span className="font-semibold text-gray-900">
                                        Logging in as {roles.find((r) => r.value === selectedRole)?.label}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedRole(null)
                                        setEmail("")
                                        setPassword("")
                                        setError("")
                                    }}
                                    className="hover:bg-white/50"
                                >
                                    Change
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-2 border-gray-200 focus:border-purple-400 rounded-xl h-12 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-2 border-gray-200 focus:border-purple-400 rounded-xl h-12 transition-colors"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-sm text-red-600 animate-slide-up">
                                    <AlertCircle className="h-5 w-5" />
                                    {error}
                                </div>
                            )}

                            <div className="rounded-xl bg-gradient-to-r from-purple-50 to-cyan-50 border-2 border-purple-200 p-4 text-sm">
                                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    Demo Credentials:
                                </p>
                                <p className="text-gray-700">Email: {roles.find((r) => r.value === selectedRole)?.demoEmail}</p>
                                <p className="text-gray-700">Password: {selectedRole}123</p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? "Logging in..." : "Login to Expentia"}
                            </Button>
                        </form>
                    )}

                    <div className="text-center text-sm text-gray-600 pt-2">
                        {"Don't have an account? "}
                        <Link
                            href="/signup"
                            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}