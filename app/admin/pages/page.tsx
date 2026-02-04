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
import { Plus, FileText } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import CustomPage from "@/models/CustomPage";
import { PageActions } from "@/components/admin/page-actions";

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  await dbConnect();
  const pages = await CustomPage.find({}).sort({ createdAt: -1 });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Custom Pages (CMS)</h2>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Page
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Access Rule</TableHead>
              <TableHead className="text-right">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page._id}>
                <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {page.title}
                </TableCell>
                <TableCell className="font-mono text-xs">{page.slug}</TableCell>
                <TableCell>
                    {page.accessRules?.requiresPlan ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {page.accessRules.requiresPlan}
                        </span>
                    ) : "Public"}
                </TableCell>
                <TableCell className="text-right">
                  <PageActions id={page._id.toString()} slug={page.slug} />
                </TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No custom pages found. Create one to embed HTML/JS content.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
