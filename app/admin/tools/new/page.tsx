"use client";

import { useEffect, useState } from "react";
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

export default function NewToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
      fetch('/api/admin/pages')
        .then(res => res.json())
        .then(data => setPages(data))
        .catch(err => console.error("Failed to load pages"));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    
    if (data.linkedPage === 'none') {
        delete data.linkedPage;
    }

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create tool");

      router.push("/admin/tools");
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
        <h2 className="text-3xl font-bold tracking-tight">Add New Tool</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Tool Name</Label>
          <Input id="name" name="name" placeholder="e.g. SEMRush" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue="SEO">
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEO">SEO</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Writing">Writing</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="active">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="linkedPage">Linked Internal Page (Access Control)</Label>
            <Select name="linkedPage" defaultValue="none" onValueChange={(val) => setIsInternal(val !== 'none')}>
            <SelectTrigger>
              <SelectValue placeholder="Select linked page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Public/External)</SelectItem>
              {pages.map((page: any) => (
                  <SelectItem key={page._id} value={page._id}>
                      {page.title} ({page.slug})
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isInternal && (
            <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input id="url" name="url" placeholder="https://..." required />
            </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Brief description..." required />
        </div>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Tool"}
            </Button>
        </div>
      </form>
    </div>
  );
}
