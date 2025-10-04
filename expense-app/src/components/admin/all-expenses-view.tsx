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
import { Textarea } from "@/components/ui/textarea"

export function AllExpensesView() {
  const { company, user } = useAuth()
  const [expenses, setExpenses] = useState(db.expenses.getByCompany(company?.id || ""))
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const refreshExpenses = () => {
    setExpenses(db.expenses.getByCompany(company?.id || ""))
  }

  const handleOverrideApproval = (expenseId: string, action: "approved" | "rejected", comment: string) => {
    const expense = db.expenses.getById(expenseId)
    if (!expense) return

    db.expenses.update(expenseId, {
      status: action,
      approvalHistory: [
        ...expense.approvalHistory,
        {
          approverId: user?.id || "",
          approverName: user?.name || "",
          action,
          comment: comment || `Admin override: ${action}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })

    refreshExpenses()
    setSelectedExpense(null)
  }

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
          <h2 className="text-2xl font-bold">All Expenses</h2>
          <p className="text-muted-foreground">View and manage all company expenses</p>
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
                      {expense.employeeName} • {new Date(expense.date).toLocaleDateString()}
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
                    <div className="text-2xl font-bold">
                      {formatCurrency(expense.amountInCompanyCurrency || expense.amount, company?.currency || "USD")}
                    </div>
                    {expense.currency !== company?.currency && (
                      <p className="text-sm text-muted-foreground">
                        Original: {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">Category: {expense.category}</p>
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
                        <DialogDescription>Review and manage expense approval</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Employee</Label>
                            <p className="text-sm font-medium">{expense.employeeName}</p>
                          </div>
                          <div>
                            <Label>Date</Label>
                            <p className="text-sm font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label>Amount</Label>
                            <p className="text-sm font-medium">{formatCurrency(expense.amount, expense.currency)}</p>
                          </div>
                          <div>
                            <Label>Category</Label>
                            <p className="text-sm font-medium">{expense.category}</p>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <p className="text-sm">{expense.description}</p>
                        </div>
                        <div>
                          <Label>Approval History</Label>
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
                        {expense.status === "pending" && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              const formData = new FormData(e.currentTarget)
                              const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-action") as
                                | "approved"
                                | "rejected"
                              handleOverrideApproval(expense.id, action, formData.get("comment") as string)
                            }}
                            className="space-y-4 border-t pt-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="comment">Admin Override Comment</Label>
                              <Textarea id="comment" name="comment" placeholder="Add a comment..." />
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" data-action="approved" className="flex-1">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button type="submit" data-action="rejected" variant="destructive" className="flex-1">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </form>
                        )}
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