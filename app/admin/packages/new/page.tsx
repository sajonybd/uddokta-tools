"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function NewPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
      fetch('/api/tools')
        .then(res => res.json())
        .then(data => setTools(data))
        .catch(err => console.error("Failed to fetch tools"));
  }, []);

  const handleToolToggle = (toolId: string) => {
      setSelectedTools(prev => 
          prev.includes(toolId) 
            ? prev.filter(id => id !== toolId)
            : [...prev, toolId]
      );
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const featuresText = formData.get('features') as string;
    const features = featuresText.split('\n').filter(line => line.trim() !== '');

    const data = {
        name: formData.get('name'),
        price: Number(formData.get('price')),
        interval: formData.get('interval'),
        status: formData.get('status'),
        stripePriceId: formData.get('stripePriceId'),
        features: features,
        tools: selectedTools,
        isTrial: isTrial,
        trialDurationDays: isTrial ? Number(formData.get('trialDurationDays')) : undefined
    };

    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create package");

      router.push("/admin/packages");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Add New Package</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name</Label>
          <Input id="name" name="name" placeholder="e.g. Premium Plan" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="29.99" required />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="interval">Billing Interval</Label>
                <Select name="interval" defaultValue="monthly">
                    <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
              <Checkbox 
                id="isTrial" 
                checked={isTrial} 
                onCheckedChange={(checked) => setIsTrial(checked as boolean)} 
              />
              <Label htmlFor="isTrial">Is this a Trial Package?</Label>
          </div>
          {isTrial && (
              <div className="mt-2">
                  <Label htmlFor="trialDurationDays">Trial Duration (Days)</Label>
                  <Input id="trialDurationDays" name="trialDurationDays" type="number" defaultValue="7" className="max-w-[100px]" />
              </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="active">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active (Visible)</SelectItem>
              <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label>Included Tools</Label>
            <Card className="p-4 max-h-[200px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tools.map(tool => (
                    <div key={tool._id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`tool-${tool._id}`} 
                            checked={selectedTools.includes(tool._id)}
                            onCheckedChange={() => handleToolToggle(tool._id)}
                        />
                        <Label htmlFor={`tool-${tool._id}`} className="cursor-pointer text-sm font-normal">
                            {tool.name}
                        </Label>
                    </div>
                ))}
            </Card>
        </div>

        <div className="space-y-2">
          <Label htmlFor="features">Features (Display Only - One per line)</Label>
          <Textarea 
            id="features" 
            name="features" 
            placeholder="Access to all tools&#10;Priority Support"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="stripePriceId">Stripe Price ID (Optional)</Label>
            <Input id="stripePriceId" name="stripePriceId" />
        </div>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Package"}
            </Button>
        </div>
      </form>
    </div>
  );
}
