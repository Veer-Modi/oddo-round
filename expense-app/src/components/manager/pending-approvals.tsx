"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/currency"
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function PendingApprovals() {
    const { user, company } = useAuth()
    const [expenses, setExpenses] = useState(db.expenses.getPendingForApprover(user?.id || ""))
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
    const [comment, setComment] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleApprove = async (expense: Expense) => {
        if (!user) return

        setIsProcessing(true)

        // Check if there are more approval levels
        const approvalRules = db.approvalRules.getByCompany(company?.id || "")

        // Find the rule that applies to this expense
        const matchingRule = approvalRules.find((rule) => {
            if (rule.conditions.length === 0) return true

            return rule.conditions.every((condition) => {
                const amount = expense.amountInCompanyCurrency || expense.amount
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
                    return expense.category === condition.value
                }
                return false
            })
        })

        let newStatus: "pending" | "approved" = "approved"
        let nextApproverId: string | undefined

        if (matchingRule && matchingRule.levels.length > 1) {
            // Find current level
            const currentLevelIndex = matchingRule.levels.findIndex((level) =>
                level.approvers.some((a) => a.userId === user.id),
            )

            // Check if there's a next level
            if (currentLevelIndex !== -1 && currentLevelIndex < matchingRule.levels.length - 1) {
                newStatus = "pending"
                const nextLevel = matchingRule.levels[currentLevelIndex + 1]
                nextApproverId = nextLevel.approvers[0]?.userId
            }
        }

        const updatedExpense: Expense = {
            ...expense,
            status: newStatus,
            currentApproverId: nextApproverId,
            approvalHistory: [
                ...expense.approvalHistory,
                {
                    approverId: user.id,
                    approverName: user.name,
                    action: "approved",
                    comment: comment || undefined,
                    timestamp: new Date().toISOString(),
                },
            ],
        }

        // If moving to next level, add pending entry for next approver
        if (newStatus === "pending" && nextApproverId) {
            const nextApprover = db.users.getById(nextApproverId)
            updatedExpense.approvalHistory.push({
                approverId: nextApproverId,
                approverName: nextApprover?.name || "",
                action: "pending",
                timestamp: new Date().toISOString(),
            })
        }

        db.expenses.update(updatedExpense)
        setExpenses(db.expenses.getPendingForApprover(user.id))
        setSelectedExpense(null)
        setComment("")
        setIsProcessing(false)
    }

    const handleReject = async (expense: Expense) => {
        if (!user) return

        setIsProcessing(true)

        const updatedExpense: Expense = {
            ...expense,
            status: "rejected",
            currentApproverId: undefined,
            approvalHistory: [
                ...expense.approvalHistory,
                {
                    approverId: user.id,
                    approverName: user.name,
                    action: "rejected",
                    comment: comment || undefined,
                    timestamp: new Date().toISOString(),
                },
            ],
        }

        db.expenses.update(updatedExpense)
        setExpenses(db.expenses.getPendingForApprover(user.id))
        setSelectedExpense(null)
        setComment("")
        setIsProcessing(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Pending Approvals</h2>
                <p className="text-muted-foreground">Review and approve expense claims from your team</p>
            </div>

            <div className="grid gap-4">
                {expenses.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                            <p className="text-lg font-medium">All caught up!</p>
                            <p className="text-muted-foreground">No pending approvals at the moment</p>
                        </CardContent>
                    </Card>
                ) : (
                    expenses.map((expense) => (
                        <Card key={expense.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{expense.description}</CardTitle>
                                        <CardDescription>
                                            {expense.employeeName} • {expense.category} • {new Date(expense.date).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        Pending
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
                                        onOpenChange={(open) => {
                                            if (!open) {
                                                setSelectedExpense(null)
                                                setComment("")
                                            }
                                        }}
                                    >
                                        <DialogTrigger asChild>
                                            <Button variant="outline" onClick={() => setSelectedExpense(expense)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Review
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Review Expense</DialogTitle>
                                                <DialogDescription>Review the expense details and approve or reject</DialogDescription>
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
                                                </div>
                                                <div>
                                                    <Label>Description</Label>
                                                    <p className="text-sm">{expense.description}</p>
                                                </div>
                                                {expense.receiptUrl && (
                                                    <div>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full bg-transparent"
                                                            onClick={() => window.open(expense.receiptUrl, "_blank")}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            View Receipt
                                                        </Button>
                                                    </div>
                                                )}
                                                <div>
                                                    <Label>Comment (Optional)</Label>
                                                    <Textarea
                                                        placeholder="Add a comment for the employee..."
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button className="flex-1" onClick={() => handleApprove(expense)} disabled={isProcessing}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="flex-1"
                                                        onClick={() => handleReject(expense)}
                                                        disabled={isProcessing}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
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