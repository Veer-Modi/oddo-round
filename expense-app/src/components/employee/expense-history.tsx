"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function ExpenseHistory() {
  const { user, company } = useAuth()
  const [expenses] = useState(db.expenses.getByEmployee(user?.id || ""))
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredExpenses = filterStatus === "all" ? expenses : expenses.filter((e) => e.status === filterStatus)

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
          <h2 className="text-2xl font-bold">Expense History</h2>
          <p className="text-muted-foreground">View all your submitted expenses</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("approved")}
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("rejected")}
          >
            Rejected
          </Button>
        </div>
      </div>

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
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
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
                        <DialogDescription>View your expense information and approval status</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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