"use client";

import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import SpeedAnalysisTemplate from "@/components/shared/pageTemplates/speedAnalysisTemplate";

export default function SpeedAnalysisPage() {
  const { monitoring } = useParams() as { monitoring: string };

  // If you ONLY want to allow `/tires/analysis`:
  if (monitoring !== "dts") {
    return <p>Analysis is not available for domain &quot;{monitoring}&quot;.</p>;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${monitoring}`;

  return (
    <DataProvider apiUrl={apiUrl} domain={monitoring}>
      <SpeedAnalysisTemplate />
    </DataProvider>
  );
}