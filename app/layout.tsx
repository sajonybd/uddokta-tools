import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers"; 
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uddokta Tools - Premium SEO Tools",
  description: "Get access to premium SEO tools at affordable prices",
  icons: {
    icon: "/favicon.ico",
  },
};

import { FloatingContact } from "@/components/floating-contact";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
          <Toaster />
          <Analytics />
          <FloatingContact />
        </AuthProvider>
      </body>
    </html>
  );
}
