"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import SpeedAnalysisTemplate from "@/components/shared/pageTemplates/speedAnalysisTemplate";

export default function DtsSpeedAnalysisPage() {
  // Point to the same endpoint you use for dts data
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dts`;

  return (
    <DataProvider apiUrl={apiUrl} domain="dts">
      <SpeedAnalysisTemplate />
    </DataProvider>
  );
}