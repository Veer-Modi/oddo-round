"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense, ExpenseCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle } from "lucide-react"
import { convertCurrency, fetchCountries, type Country } from "@/lib/currency"
import { OCRScanner } from "@/components/ocr-scanner"

const categories: ExpenseCategory[] = [
  "Travel",
  "Food",
  "Accommodation",
  "Transportation",
  "Office Supplies",
  "Entertainment",
  "Other",
]

export function SubmitExpense() {
  const { user, company } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<string[]>([])

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

  const handleOCRComplete = (result: any) => {
    const form = document.getElementById("expense-form") as HTMLFormElement
    if (form && result) {
      if (result.amount) {
        ; (form.elements.namedItem("amount") as HTMLInputElement).value = result.amount.toString()
      }
      if (result.currency) {
        ; (form.elements.namedItem("currency") as HTMLSelectElement).value = result.currency
      }
      if (result.category) {
        ; (form.elements.namedItem("category") as HTMLSelectElement).value = result.category
      }
      if (result.date) {
        ; (form.elements.namedItem("date") as HTMLInputElement).value = result.date
      }
      if (result.description) {
        ; (form.elements.namedItem("description") as HTMLTextAreaElement).value = result.description
      }
    }
  }

  const determineApprovalRoute = (amount: number, category: ExpenseCategory) => {
    const approvalRules = db.approvalRules.getByCompany(company?.id || "")

    // Find matching rule based on conditions
    const matchingRule = approvalRules.find((rule) => {
      if (!rule.conditions || rule.conditions.length === 0) return true

      return rule.conditions.every((condition) => {
        if (condition.field === "amount") {
          const value = Number.parseFloat(condition.value)
          switch (condition.operator) {
            case ">":
              return amount > value
            case "<":
              return amount < value
            case ">=":
              return amount >= value
            case "<=":
              return amount <= value
            default:
              return false
          }
        } else if (condition.field === "category") {
          return category === condition.value
        }
        return false
      })
    })

    if (!matchingRule) {
      // Default to manager approval
      const manager = user?.managerId ? db.users.getById(user.managerId) : null
      return {
        firstApproverId: manager?.id,
        approverName: manager?.name || "",
        rule: null,
      }
    }

    // Use multi-level workflow if defined
    if (matchingRule.levels && matchingRule.levels.length > 0) {
      const firstLevel = matchingRule.levels[0]
      const firstApprover = firstLevel?.approvers?.[0]
      return {
        firstApproverId: firstApprover?.userId,
        approverName: firstApprover?.userName || "",
        rule: matchingRule,
      }
    }

    // Use manager or custom approvers
    if (matchingRule.isManagerApprover) {
      const manager = user?.managerId ? db.users.getById(user.managerId) : null
      return {
        firstApproverId: manager?.id,
        approverName: manager?.name || "",
        rule: matchingRule,
      }
    } else {
      const firstApprover = matchingRule.approvers?.[0]
      return {
        firstApproverId: firstApprover?.userId,
        approverName: firstApprover?.userName || "",
        rule: matchingRule,
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !company) return

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number(formData.get("amount"))
    const currency = formData.get("currency") as string
    const category = formData.get("category") as ExpenseCategory

    // Convert to company currency if different
    let amountInCompanyCurrency = amount
    if (currency !== company.currency) {
      amountInCompanyCurrency = await convertCurrency(amount, currency, company.currency)
    }

    const { firstApproverId, approverName } = determineApprovalRoute(amountInCompanyCurrency, category)

    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      amount,
      currency,
      amountInCompanyCurrency,
      category,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      status: "pending",
      currentApproverId: firstApproverId,
      approvalHistory: firstApproverId
        ? [
          {
            approverId: firstApproverId,
            approverName,
            action: "pending",
            timestamp: new Date().toISOString(),
          },
        ]
        : [],
      createdAt: new Date().toISOString(),
    }

    db.expenses.create(newExpense)

    setIsSubmitting(false)
    setShowSuccess(true)

    // Reset form
    e.currentTarget.reset()

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <OCRScanner onScanComplete={handleOCRComplete} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit New Expense</CardTitle>
          <CardDescription>Fill in the details of your expense claim or use OCR scanner above</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" required placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  name="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  defaultValue={company?.currency}
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" required max={new Date().toISOString().split("T")[0]} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" placeholder="Describe the expense..." required rows={4} />
            </div>

            {showSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900 p-4 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Expense submitted successfully!</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Upload className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}