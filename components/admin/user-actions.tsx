"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserActionsProps {
  id: string;
}

export function UserActions({ id }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Note: Delete functionality requires API route implementation if not already exists via [id]/route.ts
  // Assuming PATCH is used for block/unblock, but DELETE for removal might be needed.
  // Using existing patterns.

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/users/${id}/subscriptions`}>
        <Button variant="outline" size="sm" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Assign Package
        </Button>
      </Link>
    </div>
  );
}
