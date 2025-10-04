"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingApprovals } from "@/components/manager/pending-approvals"
import { TeamExpenses } from "@/components/manager/team-expenses"
import { ManagerStats } from "@/components/manager/manager-stats"

export default function ManagerDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "manager") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!user || user.role !== "manager") {
    return null
  }

  return (
    <DashboardLayout title="Manager Dashboard">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white/90 backdrop-blur-sm p-2 rounded-3xl shadow-xl border-2 border-cyan-200">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Pending Approvals
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Team Expenses
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-2xl font-semibold hover:bg-cyan-50"
          >
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingApprovals />
        </TabsContent>

        <TabsContent value="team">
          <TeamExpenses />
        </TabsContent>

        <TabsContent value="stats">
          <ManagerStats />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
