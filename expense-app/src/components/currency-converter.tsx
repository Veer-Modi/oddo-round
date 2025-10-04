"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, TrendingUp } from "lucide-react"
import { convertCurrency, fetchCountries, getExchangeRateDisplay, type Country } from "@/lib/currency"

export function CurrencyConverter() {
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<string[]>([])
  const [amount, setAmount] = useState<string>("100")
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrency, setToCurrency] = useState<string>("EUR")
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<string>("")
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    fetchCountries().then((data) => {
      setCountries(data)
      const currencySet = new Set<string>()
      data.forEach((country) => {
        if (country.currencies) {
          Object.keys(country.currencies).forEach((code) => currencySet.add(code))
        }
      })
      setCurrencies(Array.from(currencySet).sort())
    })
  }, [])

  const handleConvert = async () => {
    setIsConverting(true)
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) {
      setIsConverting(false)
      return
    }

    const result = await convertCurrency(numAmount, fromCurrency, toCurrency)
    const rate = await getExchangeRateDisplay(fromCurrency, toCurrency)

    setConvertedAmount(result)
    setExchangeRate(rate)
    setIsConverting(false)
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setConvertedAmount(null)
    setExchangeRate("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Currency Converter
        </CardTitle>
        <CardDescription>Convert between different currencies with live exchange rates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from-amount">Amount</Label>
            <Input
              id="from-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-currency">From Currency</Label>
            <select
              id="from-currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-currency">To Currency</Label>
          <select
            id="to-currency"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        <Button className="w-full" onClick={handleConvert} disabled={isConverting}>
          {isConverting ? "Converting..." : "Convert"}
        </Button>

        {convertedAmount !== null && (
          <div className="rounded-lg border bg-muted p-4 space-y-2">
            <div className="text-3xl font-bold text-center">
              {convertedAmount.toFixed(2)} {toCurrency}
            </div>
            {exchangeRate && <p className="text-sm text-center text-muted-foreground">Exchange Rate: {exchangeRate}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}