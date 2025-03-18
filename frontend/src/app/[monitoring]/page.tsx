"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function MonitoringIndex() {
  // Because this is a client component, we do NOT receive { params } in the signature
  // Instead, we use the useParams() hook:
  const router = useRouter();
  const { monitoring } = useParams() as { monitoring: string };

  useEffect(() => {
    // e.g. if user visits /dts, we redirect them to /dts/overview
    router.push(`/${monitoring}/overview`);
  }, [router, monitoring]);

  return null; // No UI, just a redirect
}