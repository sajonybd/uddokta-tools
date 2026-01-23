"use client"

import { Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: 9,
    description: "Perfect for individuals and freelancers",
    features: [
      "Access to 3 tools",
      "ChatGPT Plus",
      "Canva Pro",
      "Grammarly Premium",
      "Community support",
      "Monthly billing",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: 19,
    description: "Best for agencies and small teams",
    features: [
      "Access to 6 tools",
      "All Starter tools",
      "Semrush",
      "Ahrefs",
      "Priority support",
      "Monthly billing",
      "3 team members",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 39,
    description: "For growing businesses and agencies",
    features: [
      "Access to all tools",
      "All Professional tools",
      "Adobe Creative Suite",
      "Unlimited team members",
      "24/7 dedicated support",
      "Annual discount available",
      "Custom integrations",
    ],
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Choose the plan that works for you. All plans include a 7-day free trial with full access to premium
            features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-2 transition-all duration-300 rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-primary/5 border-primary scale-105 shadow-2xl shadow-primary/30"
                  : "bg-card border-border hover:border-primary/50 hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-foreground/60 text-sm mb-6">{plan.description}</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-foreground">${plan.price}</span>
                <span className="text-foreground/60 ml-2">/month</span>
              </div>
              <Link
                href="/signup"
                className={`w-full py-3 rounded-lg font-bold transition text-center block mb-8 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30"
                    : "border-2 border-primary text-primary hover:bg-primary/5"
                }`}
              >
                Get Started
              </Link>
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 font-bold" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
