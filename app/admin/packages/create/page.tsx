"use client";

import { PackageForm } from "@/components/package-form";

export default function CreatePackagePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Create New Package</h1>
            <PackageForm />
        </div>
    );
}
