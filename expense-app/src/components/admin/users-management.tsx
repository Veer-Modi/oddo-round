"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { User, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function UsersManagement() {
  const { company, user: currentUser } = useAuth()
  const [users, setUsers] = useState(db.users.getByCompany(company?.id || ""))
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const refreshUsers = () => {
    setUsers(db.users.getByCompany(company?.id || ""))
  }

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      role: formData.get("role") as UserRole,
      companyId: company?.id || "",
      managerId: (formData.get("managerId") as string) || undefined,
      createdAt: new Date().toISOString(),
    }

    db.users.create(newUser)
    refreshUsers()
    setIsCreateDialogOpen(false)
  }

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)

    db.users.update(editingUser.id, {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as UserRole,
      managerId: (formData.get("managerId") as string) || undefined,
    })

    refreshUsers()
    setEditingUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account")
      return
    }
    if (confirm("Are you sure you want to delete this user?")) {
      db.users.delete(userId)
      refreshUsers()
    }
  }

  const managers = users.filter((u) => u.role === "manager" || u.role === "admin")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage employees and managers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new employee or manager to your company</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager (Optional)</Label>
                <select
                  id="managerId"
                  name="managerId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const manager = user.managerId ? db.users.getById(user.managerId) : null
          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge
                    variant={user.role === "admin" ? "default" : user.role === "manager" ? "secondary" : "outline"}
                  >
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {manager && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Manager: </span>
                    <span className="font-medium">{manager.name}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information and role</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Full Name</Label>
                          <Input id="edit-name" name="name" defaultValue={user.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email</Label>
                          <Input id="edit-email" name="email" type="email" defaultValue={user.email} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-role">Role</Label>
                          <select
                            id="edit-role"
                            name="role"
                            defaultValue={user.role}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-managerId">Manager</Label>
                          <select
                            id="edit-managerId"
                            name="managerId"
                            defaultValue={user.managerId || ""}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">No Manager</option>
                            {managers
                              .filter((m) => m.id !== user.id)
                              .map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                  {manager.name} ({manager.role})
                                </option>
                              ))}
                          </select>
                        </div>
                        <Button type="submit" className="w-full">
                          Update User
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 bg-transparent"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}