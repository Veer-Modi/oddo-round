"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManagement } from "@/components/admin/users-management"
import { ApprovalRulesManagement } from "@/components/admin/approval-rules-management"
import { AllExpensesView } from "@/components/admin/all-expenses-view"
import { AdminStats } from "@/components/admin/admin-stats"
import { CurrencyConverter } from "@/components/currency-converter"
import { CompanySettings } from "@/components/admin/company-settings"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white/90 backdrop-blur-sm p-2 rounded-3xl shadow-xl border-2 border-cyan-200">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Approval Rules
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="expenses">
          <AllExpensesView />
        </TabsContent>

        <TabsContent value="rules">
          <ApprovalRulesManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <CompanySettings />
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
