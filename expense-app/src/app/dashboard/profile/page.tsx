"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Building, Globe, DollarSign, Shield } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, company } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
    setIsEditing(false)
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="p-8 rounded-3xl shadow-xl border-2 border-cyan-100 bg-gradient-to-br from-white to-cyan-50/30 card-hover">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center shadow-lg ring-4 ring-cyan-200 ring-offset-4">
              <span className="text-3xl font-bold text-white">{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-600 capitalize flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4 text-lime-600" />
                {user?.role}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-600" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="mt-2 rounded-2xl border-2 border-cyan-200 focus:border-lime-400 disabled:bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="mt-2 rounded-2xl border-2 border-cyan-200 focus:border-lime-400 disabled:bg-gray-50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 rounded-2xl border-2 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Company Information Card */}
        <Card className="p-8 rounded-3xl shadow-xl border-2 border-lime-100 bg-gradient-to-br from-white to-lime-50/30 card-hover">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building className="h-6 w-6 text-lime-600" />
            Company Information
          </h3>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-50 border border-cyan-200">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Company Name</p>
                <p className="text-lg font-bold text-gray-900">{company?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-lime-50 border border-lime-200">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shadow-md">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Country</p>
                <p className="text-lg font-bold text-gray-900">{company?.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Default Currency</p>
                <p className="text-lg font-bold text-gray-900">{company?.currency}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
