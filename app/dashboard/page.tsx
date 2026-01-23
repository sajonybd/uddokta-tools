"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Package, Settings, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"

interface User {
  id: number
  name: string
  email: string
  plan: string
  trial: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-foreground/60">Welcome back, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <Card className="bg-card border-border p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Account Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Name</p>
              <p className="text-foreground font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-foreground/60 text-sm mb-1">Email</p>
              <p className="text-foreground font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-foreground/60 text-sm mb-1">Current Plan</p>
              <p className="text-foreground font-semibold capitalize">
                {user.plan} {user.trial && "(Trial)"}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border p-6 hover:border-primary/50 transition cursor-pointer">
            <Package className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">My Tools</h3>
            <p className="text-foreground/60 text-sm mb-4">Access all your premium tools</p>
            <Link href="#" className="text-primary text-sm font-semibold hover:underline">
              View Tools →
            </Link>
          </Card>

          <Card className="bg-card border-border p-6 hover:border-primary/50 transition cursor-pointer">
            <CreditCard className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Billing</h3>
            <p className="text-foreground/60 text-sm mb-4">Manage your subscription and payments</p>
            <Link href="/dashboard/billing" className="text-primary text-sm font-semibold hover:underline">
              View Billing →
            </Link>
          </Card>

          <Card className="bg-card border-border p-6 hover:border-primary/50 transition cursor-pointer">
            <Settings className="w-8 h-8 text-secondary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Settings</h3>
            <p className="text-foreground/60 text-sm mb-4">Update your account settings</p>
            <Link href="/dashboard/settings" className="text-primary text-sm font-semibold hover:underline">
              Go to Settings →
            </Link>
          </Card>
        </div>

        {/* Available Tools */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Available Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Semrush", "ChatGPT Plus", "Canva Pro", "Grammarly", "Adobe Suite", "Ahrefs"].map((tool) => (
              <div
                key={tool}
                className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition cursor-pointer text-center"
              >
                <p className="text-foreground font-semibold">{tool}</p>
                <button className="mt-2 text-sm text-primary hover:underline">Launch →</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
