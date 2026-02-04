"use client";

import Link from "next/link";
import { UserNav } from "@/components/user-nav";

export function DashboardNav() {
  return (
    <header className="border-b bg-background/95 backdrop-blur z-50 sticky top-0">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
           <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg" />
           <span className="hidden md:inline-block">SEO Tools Pro</span>
        </Link>
        <nav className="flex items-center gap-6 ml-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
                Overview
            </Link>
             <Link href="/dashboard/tools" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Tools
            </Link>
            <Link href="/dashboard/tutorials" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Tutorials
            </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
