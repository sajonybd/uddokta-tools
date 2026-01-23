"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const paymentMethods = [
    { name: "Stripe", icon: "💳" },
    { name: "PayPal", icon: "🅿️" },
    { name: "bKash", icon: "🇧🇩" },
    { name: "Rocket", icon: "🚀" },
    { name: "Nagad", icon: "📱" },
  ]

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

        <h1 className="text-4xl font-bold text-foreground mb-8">Billing & Subscription</h1>

        {/* Current Subscription */}
        <Card className="bg-card border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Current Subscription</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-foreground/60 text-sm mb-2">Plan</p>
              <p className="text-3xl font-bold text-primary capitalize mb-4">{user.plan}</p>
              <p className="text-foreground/60 mb-4">$19.00 per month</p>
              {user.trial && (
                <div className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                  Free Trial Active
                </div>
              )}
            </div>
            <div>
              <div className="mb-6">
                <p className="text-foreground/60 text-sm mb-2">Renewal Date</p>
                <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar size={18} />
                  Jan 20, 2026
                </p>
              </div>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold">
                Upgrade Plan
              </button>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-card border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Payment Methods</h2>
          <p className="text-foreground/60 mb-6">Choose your preferred payment method:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.name}
                className="p-6 border border-border rounded-lg hover:border-primary transition hover:bg-primary/5 text-center flex flex-col items-center gap-3"
              >
                <span className="text-4xl">{method.icon}</span>
                <span className="text-foreground font-semibold text-sm">{method.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Billing History */}
        <Card className="bg-card border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Billing History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground/60 text-sm font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-foreground/60 text-sm font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-foreground/60 text-sm font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-foreground/60 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-primary/5 transition">
                  <td className="py-3 px-4 text-foreground">Jan 13, 2026</td>
                  <td className="py-3 px-4 text-foreground">Free Trial Started</td>
                  <td className="py-3 px-4 text-foreground">$0.00</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
