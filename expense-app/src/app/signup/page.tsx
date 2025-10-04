"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Sparkles, Building2, Globe, Mail, Lock, User, Zap } from "lucide-react"
import Link from "next/link"
import { fetchCountries, type Country } from "@/lib/currency"

export default function SignupPage() {
    const router = useRouter()
    const { signup } = useAuth()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [countryCode, setCountryCode] = useState("US")
    const [countries, setCountries] = useState<Country[]>([])
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchCountries().then(setCountries)
    }, [])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const success = await signup(email, password, name, companyName, countryCode)

        if (success) {
            router.push("/dashboard/admin")
        } else {
            setError("Email already exists or signup failed")
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center gradient-bg p-4 overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-float" />
            <div
                className="absolute bottom-20 left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "2s" }}
            />
            <div
                className="absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-400/20 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "3s" }}
            />

            {/* Floating icons */}
            <div className="absolute top-40 left-1/4 animate-float opacity-10">
                <Building2 className="w-16 h-16 text-purple-600" />
            </div>
            <div className="absolute bottom-40 right-1/4 animate-float opacity-10" style={{ animationDelay: "1.5s" }}>
                <Zap className="w-20 h-20 text-pink-600" />
            </div>

            <Card className="relative w-full max-w-md border-0 shadow-2xl backdrop-blur-sm bg-white/95 animate-scale-in">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center mb-4 shadow-2xl animate-pulse-slow">
                        <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                        Join Expentia
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                        Create your account and start managing expenses
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="border-2 border-gray-200 focus:border-purple-400 rounded-xl h-12 transition-colors"
                            />
                        </div>

                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4 text-purple-600" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-2 border-gray-200 focus:border-purple-400 rounded-xl h-12 transition-colors"
                            />
                        </div>

                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                            <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4 text-purple-600" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="border-2 border-gray-200 focus:border-purple-400 rounded-xl h-12 transition-colors"
                            />
                        </div>

                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                            <Label htmlFor="companyName" className="text-gray-700 font-medium flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                Company Name
                            </Label>
                            <Input
                                id="companyName"
                                type="text"
                                placeholder="Acme Corporation"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                                className="border-2 border-gray-200 focus:border-purple-400 rounded-xl h-12 transition-colors"
                            />
                        </div>

                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                            <Label htmlFor="country" className="text-gray-700 font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4 text-purple-600" />
                                Country
                            </Label>
                            <select
                                id="country"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-purple-400 focus:outline-none transition-colors"
                                required
                            >
                                <option value="US">United States (USD)</option>
                                <option value="GB">United Kingdom (GBP)</option>
                                <option value="EU">European Union (EUR)</option>
                                <option value="IN">India (INR)</option>
                                <option value="CA">Canada (CAD)</option>
                                <option value="AU">Australia (AUD)</option>
                            </select>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-sm text-red-600 animate-slide-up">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl animate-slide-up"
                            style={{ animationDelay: "0.6s" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}