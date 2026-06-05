"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isImpersonated = (session?.user as any)?.isImpersonated;
  const userName = session?.user?.name || "User";
  const customId = (session?.user as any)?.customId;

  if (!isImpersonated) return null;

  const handleBackToAdmin = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/impersonate/back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate return token");
      }

      toast.success("Returning to admin account...");

      await signIn("credentials", {
        email: data.email,
        impersonateToken: data.token,
        callbackUrl: "/admin/users",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to return to admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md sm:max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between gap-3 bg-amber-950/90 text-amber-50 border border-amber-500/30 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-[0_8px_32px_0_rgba(245,158,11,0.2)] backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <ShieldAlert className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm font-medium truncate">
            Impersonating <span className="font-bold text-amber-300">{userName}</span>
            {customId && <span className="text-amber-400/80 ml-1">(UID: {customId})</span>}
          </p>
        </div>
        <Button
          size="sm"
          disabled={loading}
          onClick={handleBackToAdmin}
          className="h-8 shrink-0 rounded-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs px-3 sm:px-4 border-none shadow-sm gap-1.5 transition-all"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Back to Admin</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>
    </div>
  );
}
