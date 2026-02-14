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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (res.ok) {
        setPackages(data);
      } else {
        toast.error("Failed to fetch packages");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
      if(!confirm("Are you sure? This will delete the package.")) return;
      try {
          const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
          if(res.ok) {
              toast.success("Package deleted");
              fetchPackages();
          } else {
              toast.error("Failed to delete");
          }
      } catch(e) {
          toast.error("Error deleting");
      }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(packages.map((p: any) => p._id));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} packages?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/packages/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success("Packages deleted successfully");
        setSelectedIds([]);
        fetchPackages();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete packages");
      }
    } catch (error) {
      toast.error("Error performing bulk delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Packages</h1>
        <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete} disabled={deleting}>
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete Selected ({selectedIds.length})
                </Button>
            )}
            <Link href="/admin/packages/create">
                <Button><Plus size={16} className="mr-2" /> Create Bundle</Button>
            </Link>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                    checked={selectedIds.length === packages.length && packages.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="w-[80px]">SI</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Tools</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No packages found.
                    </TableCell>
                </TableRow>
            ) : (
                packages.map((pkg: any, index: number) => (
                <TableRow key={pkg._id} className={selectedIds.includes(pkg._id) ? "bg-muted/50" : ""}>
                    <TableCell>
                        <Checkbox 
                            checked={selectedIds.includes(pkg._id)}
                            onCheckedChange={(checked) => handleSelectOne(pkg._id, !!checked)}
                        />
                    </TableCell>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                        {pkg.name}
                        {pkg.is_featured && <Badge variant="default" className="ml-2 text-xs">Featured</Badge>}
                    </TableCell>
                    <TableCell>${pkg.price} / {pkg.interval}</TableCell>
                    <TableCell>
                        <div className="flex -space-x-2">
                             {pkg.tools && pkg.tools.slice(0, 3).map((t: any) => (
                                 <div key={t._id} className="h-6 w-6 rounded-full bg-primary/20 border flex items-center justify-center text-[10px]" title={t.name}>
                                     {t.name[0]}
                                 </div>
                             ))}
                             {pkg.tools && pkg.tools.length > 3 && (
                                 <div className="h-6 w-6 rounded-full bg-muted border flex items-center justify-center text-[10px]">
                                     +{pkg.tools.length - 3}
                                 </div>
                             )}
                             {(!pkg.tools || pkg.tools.length === 0) && <span className="text-muted-foreground text-xs">No tools</span>}
                        </div>
                    </TableCell>
                    <TableCell>
                        {pkg.tools?.length > 1 ? <Badge variant="outline">Bundle</Badge> : <Badge variant="secondary">Single</Badge>}
                    </TableCell>
                    <TableCell>
                        <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                            {pkg.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Link href={`/admin/packages/${pkg._id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit size={16} />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePackage(pkg._id)}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
