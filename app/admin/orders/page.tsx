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
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No orders found.
                    </TableCell>
                </TableRow>
            ) : (
                orders.map((order: any) => (
                <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">{order._id.substring(order._id.length - 8)}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium">{order.user?.name || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                        </div>
                    </TableCell>
                    <TableCell>${order.finalAmount}</TableCell>
                    <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                    <TableCell>
                        <Badge variant={order.status === 'approved' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Link href={`/admin/orders/${order._id}`}>
                            <Button variant="ghost" size="sm">
                                <Eye size={16} />
                            </Button>
                        </Link>
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
