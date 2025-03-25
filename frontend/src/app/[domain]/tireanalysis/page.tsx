"use client";

import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import TireAnalysisTemplate from "@/components/shared/pageTemplates/tireAnalysisTemplate";

export default function TireAnalysisPage() {
  const { domain } = useParams() as { domain: string };

  // If you ONLY want to allow `/tires/analysis`:
  if (domain !== "tires") {
    return <p>Analysis is not available for domain &quot;{domain}&quot;.</p>;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${domain}`;

  return (
    <DataProvider apiUrl={apiUrl} domain={domain}>
      <TireAnalysisTemplate />
    </DataProvider>
  );
}