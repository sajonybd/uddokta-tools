"use client";

import { PackageForm } from "@/components/package-form";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditPackagePage() {
    const { id } = useParams();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            fetch(`/api/packages/${id}`)
                .then(res => res.json())
                .then(data => {
                    setPkg(data);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!pkg) return <div>Package not found</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Package</h1>
            <PackageForm initialData={pkg} isEdit={true} />
        </div>
    );
}
