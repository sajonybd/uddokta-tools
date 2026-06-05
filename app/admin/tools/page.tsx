"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { ToolActions } from "@/components/admin/tool-actions";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function AdminToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tools");
      const data = await res.json();
      if (res.ok) {
        setTools(data);
      } else {
        toast.error("Failed to fetch tools");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(tools.map((t: any) => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} tools?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/tools/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success("Tools deleted successfully");
        setSelectedIds([]);
        fetchTools();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete tools");
      }
    } catch (error) {
      toast.error("Error performing bulk delete");
    } finally {
      setDeleting(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedTools = [...tools];
    const [draggedItem] = reorderedTools.splice(draggedIndex, 1);
    reorderedTools.splice(index, 0, draggedItem);
    
    setTools(reorderedTools);

    const payload = reorderedTools.map((t: any, idx: number) => ({
      id: t._id,
      position: idx
    }));

    try {
      const res = await fetch("/api/admin/tools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: payload })
      });
      if (!res.ok) {
        toast.error("Failed to save tool order");
        fetchTools();
      } else {
        toast.success("Tool order updated successfully");
      }
    } catch (err) {
      toast.error("Error updating tool order");
      fetchTools();
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Tools</h2>
        <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete} disabled={deleting}>
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete Selected ({selectedIds.length})
                </Button>
            )}
            <Link href="/admin/tools/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add New Tool
                </Button>
            </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[50px]">
                <Checkbox 
                    checked={selectedIds.length === tools.length && tools.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="w-[50px]">SI</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Active Users</TableHead>
              <TableHead>Limit/Max Slots</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool: any, index: number) => (
              <TableRow 
                key={tool._id} 
                className={`${selectedIds.includes(tool._id) ? "bg-muted/50" : ""} transition-all duration-200 ${draggedIndex === index ? "opacity-40 border-2 border-dashed border-primary" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <TableCell className="w-[40px] cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </TableCell>
                <TableCell>
                    <Checkbox 
                        checked={selectedIds.includes(tool._id)}
                        onCheckedChange={(checked) => handleSelectOne(tool._id, !!checked)}
                    />
                </TableCell>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell>{tool.category}</TableCell>
                <TableCell>
                  <Link href={`/admin/tools/${tool._id}/users`}>
                    <Badge className="font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 transition-all cursor-pointer text-xs py-1 px-2.5">
                      {tool.activeUsers ?? 0} Active
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell>
                  {tool.max_slots > 0 ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      Max {tool.max_slots}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Unlimited</span>
                  )}
                </TableCell>
                <TableCell>${tool.price}</TableCell>
                <TableCell>
                    <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                        {tool.status}
                    </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{tool.url}</TableCell>
                <TableCell className="text-right">
                  <ToolActions id={tool._id.toString()} />
                </TableCell>
              </TableRow>
            ))}
            {tools.length === 0 && (
                <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No tools found. Create one to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
