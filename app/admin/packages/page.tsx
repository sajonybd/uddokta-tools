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
import { Plus, Package } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import PackageModel from "@/models/Package"; // Alias to avoid naming conflict
import { PackageActions } from "@/components/admin/package-actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

async function getPackages() {
  await dbConnect();
  try {
      const packages = await PackageModel.find({}).sort({ price: 1 });
      return JSON.parse(JSON.stringify(packages));
  } catch (e) {
      return [];
  }
}

export default async function AdminPackagesPage() {
  const packages = await getPackages();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Packages</h2>
        <div className="flex items-center space-x-2">
          <Link href="/admin/packages/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Package
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No packages found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
                packages.map((pkg: any) => (
              <TableRow key={pkg._id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {pkg.name}
                    </div>
                </TableCell>
                <TableCell>${pkg.price} / {pkg.interval}</TableCell>
                <TableCell>
                    {pkg.status === 'active' ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <PackageActions id={pkg._id.toString()} />
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
