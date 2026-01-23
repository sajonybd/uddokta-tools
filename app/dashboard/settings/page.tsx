"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: true,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setFormData({
      name: parsedUser.name,
      email: parsedUser.email,
      notifications: true,
    })
  }, [router])

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, name: formData.name, email: formData.email }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-8">Settings</h1>

        {saved && (
          <div className="mb-6 p-4 bg-accent/20 border border-accent/50 rounded-lg text-accent font-medium">
            Settings saved successfully!
          </div>
        )}

        {/* Profile Settings */}
        <Card className="bg-card border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-foreground">Receive email notifications about billing and account updates</span>
            </label>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-destructive/5 border border-destructive/30 p-8">
          <h2 className="text-2xl font-bold text-destructive mb-4">Danger Zone</h2>
          <p className="text-foreground/60 mb-4">
            Delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="px-6 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition font-semibold">
            Delete Account
          </button>
        </Card>
      </div>
    </div>
  )
}
