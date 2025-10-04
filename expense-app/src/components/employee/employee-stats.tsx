"use client"

import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"

export function EmployeeStats() {
  const { user, company } = useAuth()

  if (!user || !company) return null

  const expenses = db.expenses.getByEmployee(user.id)

  const stats = {
    total: expenses.length,
    pending: expenses.filter((e) => e.status === "pending").length,
    approved: expenses.filter((e) => e.status === "approved").length,
    rejected: expenses.filter((e) => e.status === "rejected").length,
    totalApproved: expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + (e.amountInCompanyCurrency || e.amount), 0),
  }

  const statCards = [
    {
      title: "Total Expenses",
      value: stats.total,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/5",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-500/10 to-amber-600/5",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-500/10 to-green-600/5",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-500/10 to-red-600/5",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-500/10 text-red-700 border-red-200"
      case "pending":
        return "bg-amber-500/10 text-amber-700 border-amber-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="card-hover border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`rounded-lg bg-gradient-to-br ${stat.bgGradient} p-2`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 via-card to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            Total Approved Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            {formatCurrency(stats.totalApproved, company.currency)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">All your approved expenses</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-sm">{formatCurrency(expense.amount, expense.currency)}</p>
                  <p className="text-xs text-muted-foreground">{expense.category}</p>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No expenses yet. Submit your first expense!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}