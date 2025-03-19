"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DomainIndex() {
  // Because this is a client component, we do NOT receive { params } in the signature
  // Instead, we use the useParams() hook:
  const router = useRouter();
  const { domain } = useParams() as { domain: string };

  useEffect(() => {
    // e.g. if user visits /dts, we redirect them to /dts/overview
    router.push(`/${domain}/overview`);
  }, [router, domain]);

  return null; // No UI, just a redirect
}