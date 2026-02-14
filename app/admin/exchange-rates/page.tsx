
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<Record<string, number>>({
      BDT: 0,
      INR: 0,
      PKR: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
      setLoading(true);
      try {
          // Fetch from public API to see what's currently live
          const res = await fetch('/api/exchange-rates');
          const data = await res.json();
          // Merge with defaults to ensure fields exist
          setRates(prev => ({ ...prev, ...data }));
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          const res = await fetch('/api/admin/exchange-rates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rates })
          });
          
          if(res.ok) {
              toast({ title: "Rates updated successfully" });
              fetchRates();
          } else {
              throw new Error("Failed");
          }
      } catch (e) {
          toast({ title: "Failed to update rates", variant: "destructive" });
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Exchange Rates</h2>
            <p className="text-muted-foreground">Manage currency conversion rates against 1 USD.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Base Currency: USD ($1.00)</CardTitle>
                <CardDescription>Set the equivalent value for other currencies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bdt" className="text-right font-bold">BDT (৳)</Label>
                        <Input 
                            id="bdt" 
                            type="number" 
                            value={rates.BDT} 
                            onChange={e => setRates({...rates, BDT: parseFloat(e.target.value)})} 
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="inr" className="text-right font-bold">INR (₹)</Label>
                        <Input 
                            id="inr" 
                            type="number" 
                            value={rates.INR} 
                            onChange={e => setRates({...rates, INR: parseFloat(e.target.value)})} 
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pkr" className="text-right font-bold">PKR (Rs)</Label>
                        <Input 
                            id="pkr" 
                            type="number" 
                            value={rates.PKR} 
                            onChange={e => setRates({...rates, PKR: parseFloat(e.target.value)})} 
                            className="col-span-3" 
                        />
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Rates
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
