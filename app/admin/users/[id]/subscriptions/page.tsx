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
import { Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UserSubscriptionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
        fetch(`/api/admin/users/${id}/subscriptions`).then(res => res.json()),
        fetch('/api/admin/packages').then(res => res.json())
    ]).then(([userData, packagesData]) => {
        setUser(userData);
        setPackages(packagesData);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        alert("Error fetching data");
    });
  }, [id]);

  const handleAssign = async () => {
      if (!selectedPackage) return;
      setAssigning(true);
      
      const pkg = packages.find(p => p._id === selectedPackage);
      
      try {
          const res = await fetch(`/api/admin/users/${id}/subscriptions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  packageId: selectedPackage,
                  isTrial: pkg?.isTrial
              })
          });
          
          if (!res.ok) throw new Error("Failed to assign");
          
          // Refresh user data
          const updatedUser = await res.json();
          setUser(updatedUser);
          alert("Subscription assigned successfully");
      } catch (error) {
          alert("Error assigning subscription");
      } finally {
          setAssigning(false);
      }
  };

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
                      user.subscriptions.map((sub: any, idx: number) => (
                          <div key={idx} className="border p-4 rounded-lg space-y-2">
                              {/* Retrieve package details from populated field or just ID if fetch failed */}
                              <div className="flex justify-between items-start">
                                  <h4 className="font-semibold">{sub.packageId?.name || "Unknown Package"}</h4>
                                  <Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>
                                      {sub.status}
                                  </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  Expires: {new Date(sub.endDate).toLocaleDateString()}
                              </div>
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
                  <CardTitle>Assign New Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label>Select Package</Label>
                      <Select onValueChange={setSelectedPackage} value={selectedPackage}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                          <SelectContent>
                              {packages.map(pkg => (
                                  <SelectItem key={pkg._id} value={pkg._id}>
                                      {pkg.name} ({pkg.isTrial ? 'Trial' : `$${pkg.price}`})
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <Button onClick={handleAssign} disabled={assigning || !selectedPackage} className="w-full">
                      {assigning ? "Assigning..." : "Assign Subscription"}
                  </Button>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
