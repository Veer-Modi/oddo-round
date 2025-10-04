"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { CheckCircle, XCircle, Clock, Eye, Filter } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TeamExpenses() {
    const { user, company } = useAuth()
    const teamMembers = db.users.getByManager(user?.id || "")
    const allExpenses = teamMembers.flatMap((member) => db.expenses.getByEmployee(member.id))

    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterEmployee, setFilterEmployee] = useState<string>("all")

    let filteredExpenses = allExpenses

    if (filterStatus !== "all") {
        filteredExpenses = filteredExpenses.filter((e) => e.status === filterStatus)
    }

    if (filterEmployee !== "all") {
        filteredExpenses = filteredExpenses.filter((e) => e.employeeId === filterEmployee)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4" />
            case "rejected":
                return <XCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Team Expenses</h2>
                    <p className="text-muted-foreground">View all expenses from your team members</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Employee</Label>
                            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {filteredExpenses.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No expenses found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredExpenses.map((expense) => (
                        <Card key={expense.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{expense.description}</CardTitle>
                                        <CardDescription>
                                            {expense.employeeName} • {expense.category} • {new Date(expense.date).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge className={getStatusColor(expense.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(expense.status)}
                                            {expense.status}
                                        </span>
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold">{formatCurrency(expense.amount, expense.currency)}</div>
                                        {expense.currency !== company?.currency && (
                                            <p className="text-sm text-muted-foreground">
                                                ≈{" "}
                                                {formatCurrency(expense.amountInCompanyCurrency || expense.amount, company?.currency || "USD")}
                                            </p>
                                        )}
                                    </div>
                                    <Dialog
                                        open={selectedExpense?.id === expense.id}
                                        onOpenChange={(open) => !open && setSelectedExpense(null)}
                                    >
                                        <DialogTrigger asChild>
                                            <Button variant="outline" onClick={() => setSelectedExpense(expense)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Expense Details</DialogTitle>
                                                <DialogDescription>View expense information and approval history</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Employee</Label>
                                                        <p className="text-sm font-medium">{expense.employeeName}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Amount</Label>
                                                        <p className="text-sm font-medium">{formatCurrency(expense.amount, expense.currency)}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Category</Label>
                                                        <p className="text-sm font-medium">{expense.category}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Date</Label>
                                                        <p className="text-sm font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Status</Label>
                                                        <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Description</Label>
                                                    <p className="text-sm">{expense.description}</p>
                                                </div>
                                                <div>
                                                    <Label>Approval Timeline</Label>
                                                    <div className="mt-2 space-y-2">
                                                        {expense.approvalHistory.map((history, index) => (
                                                            <div key={index} className="rounded-lg border p-3 text-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium">{history.approverName}</span>
                                                                    <Badge className={getStatusColor(history.action)}>{history.action}</Badge>
                                                                </div>
                                                                {history.comment && <p className="mt-1 text-muted-foreground">{history.comment}</p>}
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {new Date(history.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}