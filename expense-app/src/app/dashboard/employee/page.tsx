"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmitExpense } from "@/components/employee/submit-expense"
import { ExpenseHistory } from "@/components/employee/expense-history"
import { EmployeeStats } from "@/components/employee/employee-stats"

export default function EmployeeDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "employee") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!user || user.role !== "employee") {
    return null
  }

  return (
    <DashboardLayout title="Employee Dashboard">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white/90 backdrop-blur-sm p-2 rounded-3xl shadow-xl border-2 border-cyan-200">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="submit"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Submit Expense
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EmployeeStats />
        </TabsContent>

        <TabsContent value="submit">
          <SubmitExpense />
        </TabsContent>

        <TabsContent value="history">
          <ExpenseHistory />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
