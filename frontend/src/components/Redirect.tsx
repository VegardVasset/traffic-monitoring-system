"use client"; // Required for hooks in Next.js

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectComponent({ target }: { target: string }) {
  const router = useRouter();

  useEffect(() => {
    router.push(target);
  }, [router, target]); // Runs once when the component mounts

  return null; // No UI, just performs redirection
}