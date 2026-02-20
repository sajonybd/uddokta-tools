"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Trash, Edit, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function UserSubscriptionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<'Package' | 'Tool'>("Package");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("30");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ endDate: "", status: "" });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
        fetch(`/api/admin/users/${id}/subscriptions`).then(res => res.json()),
        fetch('/api/admin/packages').then(res => res.json()),
        fetch('/api/admin/tools').then(res => res.json())
    ]).then(([userData, packagesData, toolsData]) => {
        setUser(userData);
        setPackages(packagesData);
        setTools(toolsData);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        alert("Error fetching data");
    });
  }, [id]);

  const handleAssign = async () => {
      if (!selectedItem) return;
      setAssigning(true);
      
      try {
          const res = await fetch(`/api/admin/users/${id}/subscriptions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  packageId: selectedItem,
                  itemType: selectedType,
                  durationDays: selectedDuration
              })
          });
          
          if (!res.ok) throw new Error("Failed to assign");
          
          const updatedUser = await res.json();
          setUser(updatedUser);
          setSelectedItem(""); 
          setSelectedDuration("30");
          alert("Subscription assigned successfully");
      } catch (error) {
          alert("Error assigning subscription");
      } finally {
          setAssigning(false);
      }
  };

  const deleteSub = async (subId: string) => {
      if(!confirm("Are you sure you want to delete this subscription?")) return;
      setProcessing(true);
      try {
        const res = await fetch(`/api/admin/users/${id}/subscriptions`, {
            method: 'DELETE',
            body: JSON.stringify({ subId })
        });
        if(res.ok) {
            const u = await res.json();
            setUser(u);
        }
      } catch(e) { alert("Failed to delete"); }
      setProcessing(false);
  }

  const startEdit = (sub: any) => {
      setEditingId(sub._id);
      setEditFormData({
          endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : "",
          status: sub.status
      });
  }

  const saveEdit = async (subId: string) => {
      setProcessing(true);
      try {
        const res = await fetch(`/api/admin/users/${id}/subscriptions`, {
            method: 'PATCH',
            body: JSON.stringify({ subId, ...editFormData })
        });
        if(res.ok) {
            const u = await res.json();
            setUser(u);
            setEditingId(null);
        }
      } catch(e) { alert("Failed to update"); }
      setProcessing(false);
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Subscriptions: {user.name}</h2>
        <Button variant="outline" onClick={() => router.back()}>Back to Users</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* Active Subscriptions List */}
          <Card>
              <CardHeader>
                  <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {user.subscriptions && user.subscriptions.length > 0 ? (
                      user.subscriptions.map((sub: any) => (
                          <div key={sub._id} className="border p-4 rounded-lg space-y-3">
                              {editingId === sub._id ? (
                                  <div className="space-y-3">
                                      <div className="font-semibold">
                                          <Badge variant="outline" className="mr-2">{sub.itemType}</Badge>
                                          {sub.packageId?.name || "Unknown Item"}
                                      </div>
                                      <div className="space-y-1">
                                          <Label>Expiry Date</Label>
                                          <Input 
                                            type="date" 
                                            value={editFormData.endDate} 
                                            onChange={e => setEditFormData({...editFormData, endDate: e.target.value})}
                                          />
                                      </div>
                                      <div className="space-y-1">
                                          <Label>Status</Label>
                                          <Select 
                                            value={editFormData.status} 
                                            onValueChange={v => setEditFormData({...editFormData, status: v})}
                                          >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                          </Select>
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={processing}>
                                              <X className="w-4 h-4 mr-1" /> Cancel
                                          </Button>
                                          <Button size="sm" onClick={() => saveEdit(sub._id)} disabled={processing}>
                                              <Check className="w-4 h-4 mr-1" /> Save
                                          </Button>
                                      </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] h-4">{sub.itemType}</Badge>
                                                <h4 className="font-semibold">{sub.packageId?.name || "Unknown Item"}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {(() => {
                                                const isExpired = new Date(sub.endDate) < new Date();
                                                const displayStatus = isExpired && sub.status === 'active' ? 'expired' : sub.status;
                                                return (
                                                    <Badge variant={displayStatus === 'active' ? 'default' : 'destructive'}>
                                                        {displayStatus}
                                                    </Badge>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            Expires: {new Date(sub.endDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(sub)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteSub(sub._id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                  </>
                              )}
                          </div>
                      ))
                  ) : (
                      <p className="text-muted-foreground">No subscriptions found.</p>
                  )}
              </CardContent>
          </Card>

          {/* Assign New Subscription */}
          <Card>
              <CardHeader>
                  <CardTitle>Assign New Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label>Item Type</Label>
                      <Select value={selectedType} onValueChange={(v: any) => {
                          setSelectedType(v);
                          setSelectedItem("");
                      }}>
                          <SelectTrigger>
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Package">Package</SelectItem>
                              <SelectItem value="Tool">Individual Tool</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label>Select {selectedType}</Label>
                      <Select onValueChange={setSelectedItem} value={selectedItem}>
                          <SelectTrigger>
                              <SelectValue placeholder={`Select a ${selectedType.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                              {(selectedType === 'Package' ? packages : tools).map(item => (
                                  <SelectItem key={item._id} value={item._id}>
                                      {item.name} ({item.isTrial ? 'Trial' : `$${item.price}`})
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                       <Label>Duration</Label>
                       <Select onValueChange={setSelectedDuration} value={selectedDuration}>
                           <SelectTrigger>
                               <SelectValue placeholder="Select duration" />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="30">1 Month</SelectItem>
                               <SelectItem value="90">3 Months</SelectItem>
                               <SelectItem value="180">6 Months</SelectItem>
                               <SelectItem value="365">1 Year</SelectItem>
                               <SelectItem value="730">2 Years</SelectItem>
                               <SelectItem value="36500">Lifetime</SelectItem>
                           </SelectContent>
                       </Select>
                  </div>

                  <Button onClick={handleAssign} disabled={assigning || !selectedItem} className="w-full">
                      {assigning ? "Assigning..." : "Assign Subscription"}
                  </Button>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
