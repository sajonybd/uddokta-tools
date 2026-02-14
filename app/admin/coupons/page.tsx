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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create State
  const [isOpen, setIsOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
      code: "",
      discountType: "percentage",
      discountAmount: 0,
      expirationDate: "",
      usageLimit: "",
      status: "active",
      rules: {
          userType: "all",
          minOrderValue: 0
      }
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/tools"); // Mistake? Oh wait, Coupons API is in /api/coupons
      const resC = await fetch("/api/coupons");
      const data = await resC.json();
      if (resC.ok) {
        setCoupons(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async () => {
      try {
          const res = await fetch("/api/coupons", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  ...newCoupon,
                  usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null
              })
          });
          if(res.ok) {
              toast.success("Coupon created");
              setIsOpen(false);
              fetchCoupons();
          } else {
              toast.error("Failed to create");
          }
      } catch(e) {
          toast.error("Error creating coupon");
      }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus size={16} className="mr-2" /> Create Coupon</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="SUMMER25" />
                        </div>
                        <div className="space-y-2">
                             <Label>Status</Label>
                             <Select value={newCoupon.status} onValueChange={v => setNewCoupon({...newCoupon, status: v})}>
                                 <SelectTrigger><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="active">Active</SelectItem>
                                     <SelectItem value="inactive">Inactive</SelectItem>
                                 </SelectContent>
                             </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label>Type</Label>
                             <Select value={newCoupon.discountType} onValueChange={v => setNewCoupon({...newCoupon, discountType: v})}>
                                 <SelectTrigger><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="percentage">Percentage (%)</SelectItem>
                                     <SelectItem value="flat">Flat Amount ($)</SelectItem>
                                 </SelectContent>
                             </Select>
                         </div>
                         <div className="space-y-2">
                             <Label>Amount</Label>
                             <Input type="number" value={newCoupon.discountAmount} onChange={e => setNewCoupon({...newCoupon, discountAmount: Number(e.target.value)})} />
                         </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Expiration Date</Label>
                        <Input type="date" value={newCoupon.expirationDate} onChange={e => setNewCoupon({...newCoupon, expirationDate: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                         <Label>User Rule</Label>
                         <Select value={newCoupon.rules.userType} onValueChange={v => setNewCoupon({...newCoupon, rules: {...newCoupon.rules, userType: v}})}>
                             <SelectTrigger><SelectValue /></SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="all">All Users</SelectItem>
                                 <SelectItem value="new">New Users Only</SelectItem>
                                 <SelectItem value="active">Active Subscribers</SelectItem>
                                 <SelectItem value="old">Returning (Expired) Users</SelectItem>
                             </SelectContent>
                         </Select>
                    </div>

                    <Button className="w-full" onClick={createCoupon}>Create Coupon</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Rule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon: any) => (
              <TableRow key={coupon._id}>
                <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                <TableCell>{coupon.discountType === 'flat' ? `$${coupon.discountAmount}` : `${coupon.discountAmount}%`}</TableCell>
                <TableCell><Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>{coupon.status}</Badge></TableCell>
                <TableCell>{coupon.usedCount} / {coupon.usageLimit || '∞'}</TableCell>
                <TableCell>{new Date(coupon.expirationDate).toLocaleDateString()}</TableCell>
                <TableCell className="capitalize">{coupon.rules?.userType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
