"use client";

import { SessionProvider } from "next-auth/react";

import { CartProvider } from "@/components/providers/cart-provider";
import { Toaster } from "sonner";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </SessionProvider>
  );
}
