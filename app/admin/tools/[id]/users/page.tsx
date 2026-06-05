"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Users, Calendar, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ToolUsersPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/tools/${id}/users`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load users list");
        router.push("/admin/tools");
      });
  }, [id, router]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
  if (!data || !data.tool) return <div className="p-8 text-center text-red-500">Tool not found</div>;

  const { tool, subscriptions } = data;

  // Helper to format remaining time
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "1 day remaining";
    if (diffDays > 365) return "Lifetime / Multi-year";
    return `${diffDays} days remaining`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Users: {tool.name}</h2>
          <p className="text-muted-foreground text-sm">List of users who currently have active access to this tool.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Unique active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slot limit</CardTitle>
            <Badge className="h-4 w-4 p-0 rounded-full flex items-center justify-center text-[8px] bg-primary/20 text-primary border-0">L</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tool.max_slots > 0 ? `${tool.max_slots} slots` : "Unlimited"}
            </div>
            <p className="text-xs text-muted-foreground">
              {tool.max_slots > 0 
                ? `${tool.max_slots - subscriptions.length} slots available`
                : "No limit set on this tool"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool category</CardTitle>
            <Badge className="h-4 w-4 p-0 rounded-full flex items-center justify-center text-[8px] bg-primary/20 text-primary border-0">C</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tool.category}</div>
            <p className="text-xs text-muted-foreground">Category label</p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Access Granted Via</TableHead>
              <TableHead>Billing/Interval</TableHead>
              <TableHead>Amount/Method</TableHead>
              <TableHead>Purchased On</TableHead>
              <TableHead>Expires On</TableHead>
              <TableHead>Time Left</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub: any) => (
              <TableRow key={sub._id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm">{sub.user?.name || "Deleted User"}</p>
                    <p className="text-xs text-muted-foreground">{sub.user?.email || "N/A"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={sub.itemType === "Tool" ? "outline" : "default"}>
                      {sub.itemType}
                    </Badge>
                    <span className="text-sm font-medium">
                      {sub.packageId?.name || "Direct Access"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{sub.packageId?.interval || "N/A"}</span>
                </TableCell>
                <TableCell>
                  {sub.orderId ? (
                    <div>
                      <p className="text-sm font-semibold">${sub.orderId.finalAmount || 0}</p>
                      <p className="text-xs text-muted-foreground capitalize">{sub.orderId.paymentMethod || "online"}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Manual Assign</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{new Date(sub.startDate).toLocaleDateString()}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{new Date(sub.endDate).toLocaleDateString()}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={getDaysRemaining(sub.endDate).includes("remaining") ? "outline" : "destructive"}>
                    {getDaysRemaining(sub.endDate)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/users/${sub.user?._id}/subscriptions`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                      Manage Sub <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}

            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No active users found for this tool.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
