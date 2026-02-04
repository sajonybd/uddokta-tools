"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b-2 border-primary/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg group-hover:shadow-lg group-hover:shadow-primary/30 transition-all" />
            <span className="font-bold text-lg text-foreground">SEO Tools Pro</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#tools" className="text-foreground/70 hover:text-primary transition font-medium">
              Tools
            </a>
            <a href="#pricing" className="text-foreground/70 hover:text-primary transition font-medium">
              Pricing
            </a>
            <a href="#features" className="text-foreground/70 hover:text-primary transition font-medium">
              Features
            </a>
            {session ? (
               <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium">
                      Client Area
                  </Link>
                  <span className="text-sm font-medium hidden lg:inline-block">{session.user?.name}</span>
               </div>
            ) : (
                <>
                    <Link href="/login" className="text-foreground/70 hover:text-primary transition font-medium">
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium shadow-xl shadow-primary/30"
                    >
                      Sign Up
                    </Link>
                </>
            )}

          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            <a href="#tools" className="block text-foreground/70 hover:text-primary py-2 font-medium">
              Tools
            </a>
            <a href="#pricing" className="block text-foreground/70 hover:text-primary py-2 font-medium">
              Pricing
            </a>
            <a href="#features" className="block text-foreground/70 hover:text-primary py-2 font-medium">
              Features
            </a>
             {session ? (
                 <>
                    <Link href="/dashboard" className="block w-full px-6 py-2 bg-primary/10 text-primary rounded-lg text-center font-medium">
                        Client Area
                    </Link>
                    <div className="px-3 py-2 text-sm font-medium text-foreground/70">
                        Signed in as {session.user?.name}
                    </div>
                     {/* Logout already available in dashboard, but we can keep it here or remove */}
                 </>
             ) : (
                <>
                    <Link href="/login" className="block text-foreground/70 hover:text-primary py-2 font-medium">
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg text-center font-medium shadow-xl shadow-primary/30"
                    >
                      Sign Up
                    </Link>
                </>
             )}
          </div>
        )}
      </div>
    </nav>
  )
}
