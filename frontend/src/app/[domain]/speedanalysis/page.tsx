"use client";

import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import SpeedAnalysisTemplate from "@/components/dts/pageTemplates/SpeedAnalysisTemplate";

export default function SpeedAnalysisPage() {
  const { domain } = useParams() as { domain: string };

  // If you ONLY want to allow `/tires/analysis`:
  if (domain !== "dts") {
    return <p>Analysis is not available for domain &quot;{domain}&quot;.</p>;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${domain}`;

  return (
    <DataProvider apiUrl={apiUrl} domain={domain}>
      <SpeedAnalysisTemplate />
    </DataProvider>
  );
}