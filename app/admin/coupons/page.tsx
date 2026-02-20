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
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState<string | null>(null);
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

  const resetForm = () => {
    setNewCoupon({
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
    setIsEditing(false);
    setCurrentCouponId(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsOpen(open);
  };

  const handleEdit = (coupon: any) => {
    setNewCoupon({
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        expirationDate: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString().split('T')[0] : "",
        usageLimit: coupon.usageLimit || "",
        status: coupon.status,
        rules: {
            userType: coupon.rules?.userType || "all",
            minOrderValue: coupon.rules?.minOrderValue || 0
        }
    });
    setIsEditing(true);
    setCurrentCouponId(coupon._id);
    setIsOpen(true);
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
        const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Coupon deleted");
            fetchCoupons();
        } else {
            toast.error("Failed to delete");
        }
    } catch (e) {
        toast.error("Error deleting coupon");
    }
  };

  const saveCoupon = async () => {
      try {
          const url = isEditing ? `/api/coupons/${currentCouponId}` : "/api/coupons";
          const method = isEditing ? "PATCH" : "POST";
          
          const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  ...newCoupon,
                  usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null
              })
          });
          if(res.ok) {
              toast.success(isEditing ? "Coupon updated" : "Coupon created");
              setIsOpen(false);
              resetForm();
              fetchCoupons();
          } else {
              toast.error(isEditing ? "Failed to update" : "Failed to create");
          }
      } catch(e) {
          toast.error("Error saving coupon");
      }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button onClick={() => { setIsEditing(false); resetForm(); }}><Plus size={16} className="mr-2" /> Create Coupon</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Expiration Date</Label>
                            <Input type="date" value={newCoupon.expirationDate} onChange={e => setNewCoupon({...newCoupon, expirationDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input type="number" value={newCoupon.usageLimit} onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value})} placeholder="∞" />
                        </div>
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

                    <Button className="w-full" onClick={saveCoupon}>{isEditing ? "Update Coupon" : "Create Coupon"}</Button>
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
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                            <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCoupon(coupon._id)}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
