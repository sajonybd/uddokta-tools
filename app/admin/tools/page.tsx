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
import { Plus } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import { ToolActions } from "@/components/admin/tool-actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function AdminToolsPage() {
  await dbConnect();
  const tools = await Tool.find({}).sort({ createdAt: -1 });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Tools</h2>
        <Link href="/admin/tools/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Tool
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => (
              <TableRow key={tool._id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell>{tool.category}</TableCell>
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
