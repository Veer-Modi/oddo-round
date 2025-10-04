"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { ApprovalRule, ApprovalLevel, ExpenseCategory } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Save, X, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

const categories: ExpenseCategory[] = [
  "Travel",
  "Food",
  "Accommodation",
  "Transportation",
  "Office Supplies",
  "Entertainment",
  "Other",
]

export function ApprovalRulesManagement() {
  const { company } = useAuth()
  const [rules, setRules] = useState(db.approvalRules.getByCompany(company?.id || ""))
  const [isCreating, setIsCreating] = useState(false)
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null)

  const allUsers = db.users.getByCompany(company?.id || "")
  const managers = allUsers.filter((u) => u.role === "manager")

  const handleCreateRule = () => {
    setIsCreating(true)
  }

  const handleSaveNewRule = (rule: Partial<ApprovalRule>) => {
    if (!company) return

    const newRule: ApprovalRule = {
      id: `rule-${Date.now()}`,
      companyId: company.id,
      name: rule.name || "New Rule",
      isManagerApprover: rule.isManagerApprover ?? true,
      conditions: rule.conditions || [],
      levels: rule.levels || [],
      approvers: rule.approvers || [],
      createdAt: new Date().toISOString(),
    }

    db.approvalRules.create(newRule)
    setRules(db.approvalRules.getByCompany(company.id))
    setIsCreating(false)
  }

  const handleUpdateRule = (rule: ApprovalRule) => {
    db.approvalRules.update(rule)
    setRules(db.approvalRules.getByCompany(company?.id || ""))
    setEditingRule(null)
  }

  const handleDeleteRule = (ruleId: string) => {
    db.approvalRules.delete(ruleId)
    setRules(db.approvalRules.getByCompany(company?.id || ""))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approval Rules</h2>
          <p className="text-muted-foreground">Configure conditional approval workflows and multi-level approvals</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateRule}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Approval Rule</DialogTitle>
              <DialogDescription>Define conditions and approval levels for expense processing</DialogDescription>
            </DialogHeader>
            <ApprovalRuleForm
              managers={managers}
              allUsers={allUsers}
              onSave={handleSaveNewRule}
              onCancel={() => setIsCreating(false)}
              currency={company?.currency || "USD"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No approval rules configured</p>
              <p className="text-muted-foreground mb-4">
                Create your first approval rule to automate expense workflows
              </p>
              <Button onClick={handleCreateRule}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <CardDescription>
                      {rule.isManagerApprover ? "Manager-based approval" : "Custom approvers"}
                      {(rule.levels?.length ?? 0) > 0 && ` • ${rule.levels.length} approval levels`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={editingRule?.id === rule.id} onOpenChange={(open) => !open && setEditingRule(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingRule(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Approval Rule</DialogTitle>
                          <DialogDescription>Update conditions and approval levels</DialogDescription>
                        </DialogHeader>
                        <ApprovalRuleForm
                          rule={rule}
                          managers={managers}
                          allUsers={allUsers}
                          onSave={handleUpdateRule}
                          onCancel={() => setEditingRule(null)}
                          currency={company?.currency || "USD"}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(rule.conditions?.length ?? 0) > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Conditions</Label>
                    <div className="flex flex-wrap gap-2">
                      {(rule.conditions || []).map((condition, index) => (
                        <Badge key={index} variant="secondary">
                          {condition.field === "amount" && `Amount ${condition.operator} ${condition.value}`}
                          {condition.field === "category" && `Category = ${condition.value}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(rule.levels?.length ?? 0) > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Approval Levels</Label>
                    <div className="space-y-2">
                      {(rule.levels || []).map((level, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-muted">
                          <Badge>{`Level ${index + 1}`}</Badge>
                          <span className="text-sm">{level.approvers.map((a) => a.userName).join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!rule.isManagerApprover && (rule.approvers?.length ?? 0) > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Approvers</Label>
                    <div className="flex flex-wrap gap-2">
                      {(rule.approvers || []).map((approver) => (
                        <Badge key={approver.userId} variant="secondary">
                          {approver.userName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function ApprovalRuleForm({
  rule,
  managers,
  allUsers,
  onSave,
  onCancel,
  currency,
}: {
  rule?: ApprovalRule
  managers: any[]
  allUsers: any[]
  onSave: (rule: any) => void
  onCancel: () => void
  currency: string
}) {
  const [name, setName] = useState(rule?.name || "")
  const [isManagerApprover, setIsManagerApprover] = useState(rule?.isManagerApprover ?? true)
  const [conditions, setConditions] = useState(rule?.conditions || [])
  const [levels, setLevels] = useState<ApprovalLevel[]>(rule?.levels || [])
  const [approvers, setApprovers] = useState(rule?.approvers || [])

  const handleAddCondition = () => {
    setConditions([...conditions, { field: "amount", operator: ">", value: "1000" }])
  }

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const handleUpdateCondition = (index: number, updates: any) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    setConditions(newConditions)
  }

  const handleAddLevel = () => {
    setLevels([...levels, { level: levels.length + 1, approvers: [] }])
  }

  const handleRemoveLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index))
  }

  const handleAddApproverToLevel = (levelIndex: number, userId: string) => {
    const user = allUsers.find((u) => u.id === userId)
    if (!user) return

    const newLevels = [...levels]
    if (!newLevels[levelIndex].approvers.some((a) => a.userId === userId)) {
      newLevels[levelIndex].approvers.push({
        userId: user.id,
        userName: user.name,
      })
      setLevels(newLevels)
    }
  }

  const handleRemoveApproverFromLevel = (levelIndex: number, userId: string) => {
    const newLevels = [...levels]
    newLevels[levelIndex].approvers = newLevels[levelIndex].approvers.filter((a) => a.userId !== userId)
    setLevels(newLevels)
  }

  const handleAddApprover = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId)
    if (!user || approvers.some((a) => a.userId === userId)) return

    setApprovers([...approvers, { userId: user.id, userName: user.name }])
  }

  const handleRemoveApprover = (userId: string) => {
    setApprovers(approvers.filter((a) => a.userId !== userId))
  }

  const handleSave = () => {
    const ruleData = {
      ...rule,
      name,
      isManagerApprover,
      conditions,
      levels,
      approvers,
    }
    onSave(ruleData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="rule-name">Rule Name *</Label>
        <Input
          id="rule-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., High Value Expenses"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Use Manager as Approver</Label>
          <p className="text-sm text-muted-foreground">Route expenses to employee's direct manager</p>
        </div>
        <Switch checked={isManagerApprover} onCheckedChange={setIsManagerApprover} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Conditions (Optional)</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>
        {conditions.map((condition, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>Field</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={condition.field}
                onChange={(e) => handleUpdateCondition(index, { field: e.target.value })}
              >
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
            </div>
            {condition.field === "amount" && (
              <>
                <div className="flex-1 space-y-2">
                  <Label>Operator</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={condition.operator}
                    onChange={(e) => handleUpdateCondition(index, { operator: e.target.value })}
                  >
                    <option value=">">Greater than</option>
                    <option value="<">Less than</option>
                    <option value=">=">Greater or equal</option>
                    <option value="<=">Less or equal</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value ({currency})</Label>
                  <Input
                    type="number"
                    value={condition.value}
                    onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                  />
                </div>
              </>
            )}
            {condition.field === "category" && (
              <div className="flex-1 space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={condition.value}
                  onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveCondition(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Approval Levels (Multi-level Workflow)</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddLevel}>
            <Plus className="h-4 w-4 mr-2" />
            Add Level
          </Button>
        </div>
        {levels.map((level, levelIndex) => (
          <Card key={levelIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Level {levelIndex + 1}</CardTitle>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveLevel(levelIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Add Approver</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddApproverToLevel(levelIndex, e.target.value)
                      e.target.value = ""
                    }
                  }}
                >
                  <option value="">Select user...</option>
                  {allUsers
                    .filter((u) => !level.approvers.some((a) => a.userId === u.id))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {level.approvers.map((approver) => (
                  <Badge key={approver.userId} variant="secondary" className="gap-1">
                    {approver.userName}
                    <button
                      type="button"
                      onClick={() => handleRemoveApproverFromLevel(levelIndex, approver.userId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isManagerApprover && (
        <div className="space-y-4">
          <Label>Custom Approvers</Label>
          <div className="space-y-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  handleAddApprover(e.target.value)
                  e.target.value = ""
                }
              }}
            >
              <option value="">Select approver...</option>
              {managers
                .filter((m) => !approvers.some((a) => a.userId === m.id))
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {approvers.map((approver) => (
              <Badge key={approver.userId} variant="secondary" className="gap-1">
                {approver.userName}
                <button
                  type="button"
                  onClick={() => handleRemoveApprover(approver.userId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Rule
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}