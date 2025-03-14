"use client";

import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";
import { DataProvider } from "@/context/DataContext";

export default function VPCOverviewPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vpc`;
  return (
    <DataProvider apiUrl={apiUrl} domain="vpc">
      <OverviewTemplate domainTitle="VPC" defaultBinSize="day" />
    </DataProvider>
  );
}
