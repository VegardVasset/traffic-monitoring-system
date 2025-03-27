"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DomainIndex() {
  const router = useRouter();
  const { domain } = useParams() as { domain: string };

  useEffect(() => {
    router.push(`/${domain}/overview`);
  }, [router, domain]);

  return null; 
}