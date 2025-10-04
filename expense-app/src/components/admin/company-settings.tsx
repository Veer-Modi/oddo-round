"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Save } from "lucide-react"
import { fetchCountries, type Country } from "@/lib/currency"
import { useEffect } from "react"

export function CompanySettings() {
  const { company } = useAuth()
  const [companyName, setCompanyName] = useState(company?.name || "")
  const [currency, setCurrency] = useState(company?.currency || "USD")
  const [countryCode, setCountryCode] = useState(company?.countryCode || "US")
  const [countries, setCountries] = useState<Country[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchCountries().then(setCountries)
  }, [])

  useEffect(() => {
    if (company) {
      setCompanyName(company.name)
      setCurrency(company.currency)
      setCountryCode(company.countryCode)
    }
  }, [company])

  const handleSave = () => {
    if (!company) return

    setIsSaving(true)

    db.companies.update(company.id, {
      name: companyName,
      currency,
      countryCode,
    })

    setIsSaving(false)
    setShowSuccess(true)

    setTimeout(() => setShowSuccess(false), 3000)
  }

  const selectedCountry = countries.find((c) => c.cca2 === countryCode)
  const availableCurrencies = selectedCountry?.currencies ? Object.keys(selectedCountry.currencies) : [currency]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Company Settings</CardTitle>
        </div>
        <CardDescription>Manage your company information and default currency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value)
                const country = countries.find((c) => c.cca2 === e.target.value)
                if (country?.currencies) {
                  const firstCurrency = Object.keys(country.currencies)[0]
                  setCurrency(firstCurrency)
                }
              }}
            >
              {countries.map((country) => (
                <option key={country.cca2} value={country.cca2}>
                  {country.name.common}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <select
              id="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {availableCurrencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                  {selectedCountry?.currencies?.[curr]?.name && ` - ${selectedCountry.currencies[curr].name}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showSuccess && (
          <div className="rounded-lg bg-green-100 dark:bg-green-900 p-4 text-green-800 dark:text-green-200">
            <p className="font-medium">Settings saved successfully!</p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}