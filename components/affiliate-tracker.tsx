"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackerContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (ref) {
      const maxAge = 90 * 24 * 60 * 60; // 90 days in seconds
      document.cookie = `referredBy=${encodeURIComponent(ref)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  }, [searchParams]);

  return null;
}

export function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
