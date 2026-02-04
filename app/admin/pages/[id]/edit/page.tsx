"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Loader2, Trash } from "lucide-react";

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string; 

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
      fetch(`/api/admin/pages/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch page");
            return res.json();
        })
        .then(data => {
            setPage(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            alert("Error fetching page details");
            router.push("/admin/pages");
        });
  }, [id, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Construct payload
    const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        accessRules: {
            requiresPlan: data.requiresPlan === 'none' ? null : data.requiresPlan,
        }
    };

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update page");

      router.push("/admin/pages");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Edit Page: {page.title}</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
        {/* ... similar form fields ... */}
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" name="title" defaultValue={page.title} required />
            </div>

            <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL path)</Label>
            <Input id="slug" name="slug" defaultValue={page.slug} required />
            </div>
        </div>


        
        <div className="space-y-2">
          <Label htmlFor="content">HTML Content</Label>
          <Textarea 
            id="content" 
            name="content" 
            defaultValue={page.content}
            className="font-mono min-h-[400px]"
            required 
          />
        </div>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
            {submitting ? "Update Page" : "Update Page"}
            </Button>
        </div>
      </form>
    </div>
  );
}
