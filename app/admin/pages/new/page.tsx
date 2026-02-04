"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 

export default function NewPageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Basic slugify
      const val = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(val);
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Construct accessRules object structure manually or update backend to handle flat form
    const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        accessRules: {
            requiresPlan: data.requiresPlan === 'none' ? null : data.requiresPlan,
            // allowedRoles could be added here
        }
    };

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create page");

      router.push("/admin/pages");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Create Custom Page</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" name="title" placeholder="e.g. Semrush Access Guide" required onChange={handleTitleChange} />
            </div>

            <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL path)</Label>
            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
        </div>


        
        <div className="space-y-2">
          <Label htmlFor="content">HTML Content</Label>
          <p className="text-xs text-muted-foreground mb-2">Paste your HTML/JS code here. This will be rendered inside the viewer.</p>
          <Textarea 
            id="content" 
            name="content" 
            placeholder="<h1>Hello World</h1><script>...</script>" 
            className="font-mono min-h-[400px]"
            required 
          />
        </div>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Publish Page"}
            </Button>
        </div>
      </form>
    </div>
  );
}
