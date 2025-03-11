"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import TireAnalysisTemplate from "@/components/shared/pageTemplates/tireAnalysisTemplate";

export default function TiresAnalysisPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tires`;

  return (
    <DataProvider apiUrl={apiUrl} domain="tires">
      <TireAnalysisTemplate />
    </DataProvider>
  );
}
