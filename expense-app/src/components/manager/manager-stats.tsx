
"use client"

import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, DollarSign, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

export function ManagerStats() {
    const { user, company } = useAuth()

    if (!user || !company) return null

    // Get team members
    const teamMembers = db.users.getByManager(user.id)

    // Get all expenses for team members
    const teamExpenses = teamMembers.flatMap((member) => db.expenses.getByEmployee(member.id))

    const stats = {
        teamSize: teamMembers.length,
        totalExpenses: teamExpenses.length,
        pending: teamExpenses.filter((e) => e.status === "pending").length,
        approved: teamExpenses.filter((e) => e.status === "approved").length,
        rejected: teamExpenses.filter((e) => e.status === "rejected").length,
        totalApproved: teamExpenses
            .filter((e) => e.status === "approved")
            .reduce((sum, e) => sum + (e.amountInCompanyCurrency || e.amount), 0),
        totalPending: teamExpenses
            .filter((e) => e.status === "pending")
            .reduce((sum, e) => sum + (e.amountInCompanyCurrency || e.amount), 0),
    }

    // Calculate expenses by category
    const expensesByCategory = teamExpenses.reduce(
        (acc, expense) => {
            const category = expense.category
            if (!acc[category]) {
                acc[category] = { count: 0, total: 0 }
            }
            acc[category].count++
            acc[category].total += expense.amountInCompanyCurrency || expense.amount
            return acc
        },
        {} as Record<string, { count: number; total: number }>,
    )

    const topCategories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)

    const statCards = [
        {
            title: "Team Members",
            value: stats.teamSize,
            icon: Users,
            color: "text-blue-600",
        },
        {
            title: "Total Expenses",
            value: stats.totalExpenses,
            icon: FileText,
            color: "text-purple-600",
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: FileText,
            color: "text-yellow-600",
        },
        {
            title: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            color: "text-green-600",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Total Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(stats.totalApproved, company.currency)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">All approved team expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-yellow-600" />
                            Pending Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">
                            {formatCurrency(stats.totalPending, company.currency)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Awaiting your approval</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topCategories.map(([category, data]) => (
                            <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{category}</span>
                                    <span className="text-muted-foreground">
                                        {data.count} expenses • {formatCurrency(data.total, company.currency)}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{
                                            width: `${(data.total / stats.totalApproved) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {topCategories.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No expense data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {teamMembers.map((member) => {
                            const memberExpenses = db.expenses.getByEmployee(member.id)
                            const memberTotal = memberExpenses
                                .filter((e) => e.status === "approved")
                                .reduce((sum, e) => sum + (e.amountInCompanyCurrency || e.amount), 0)

                            return (
                                <div key={member.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(memberTotal, company.currency)}</p>
                                        <p className="text-sm text-muted-foreground">{memberExpenses.length} expenses</p>
                                    </div>
                                </div>
                            )
                        })}
                        {teamMembers.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No team members assigned</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
