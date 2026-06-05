"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

interface UserActionsProps {
  id: string;
  email: string;
}

export function UserActions({ id, email }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate impersonation token");
      }

      toast.success("Impersonating user...");

      const result = await signIn("credentials", {
        email,
        impersonateToken: data.token,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Logged in successfully!");
      
      // Perform navigation and refresh local state
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to impersonate user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/users/${id}/subscriptions`}>
        <Button variant="outline" size="sm" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Assign Package
        </Button>
      </Link>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleImpersonate} 
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Login As
      </Button>
    </div>
  );
}
