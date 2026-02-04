"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ToolActionsProps {
  id: string;
}

export function ToolActions({ id }: ToolActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (error) {
      alert("Error deleting tool");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/tools/${id}/edit`}>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading} className="text-destructive hover:bg-destructive/10">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
