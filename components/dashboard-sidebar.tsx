"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Wrench,
  Users,
  ShieldAlert,
  FileText,
  Package
} from "lucide-react";
import { useSession } from "next-auth/react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin' || session?.user?.email === "admin@example.com"; 
  // Ideally rely strictly on role, but keeping email fallback for testing if role update isn't instant in DB/Session 
  // for current user without re-login.

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tools",
      href: "/dashboard/tools",
      icon: Wrench,
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminItems = [
    {
       title: "Admin Overview",
       href: "/admin",
       icon: ShieldAlert,
    },
    {
      title: "Manage Tools",
      href: "/admin/tools",
      icon: Wrench,
    },
    {
       title: "CMS Pages",
       href: "/admin/pages",
       icon: FileText,
    },
    {
       title: "Manage Users",
       href: "/admin/users",
       icon: Users,
    },
    {
       title: "Manage Packages",
       href: "/admin/packages",
       icon: Package,
    }
  ];

  return (
    <nav className="grid items-start gap-2 p-4">
      <div className="px-2 py-2">
         <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {isAdmin && (
         <div className="px-2 py-2 mt-4">
           <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-primary">
              Admin
            </h2>
           <div className="space-y-1">
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
           </div>
         </div>
      )}
    </nav>
  );
}
