"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function DeviceLimitWarningClient() {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (session && (session.user as any)?.deviceLimitWarning) {
      setShowWarning(true);
      // Optional: Auto-hide after 15 seconds
      const timer = setTimeout(() => setShowWarning(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  if (!showWarning) return null;

  return (
    <div className="mb-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Security Warning</AlertTitle>
        <AlertDescription>
          You have reached your device limit. We have securely logged out all your other active devices.
        </AlertDescription>
      </Alert>
    </div>
  );
}
