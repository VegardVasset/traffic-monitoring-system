"use client";

import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";
import { DataProvider } from "@/context/DataContext";

export default function TiresOverviewPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dts`;
  return (
    <DataProvider apiUrl={apiUrl} domain="dts">
      <OverviewTemplate domainTitle="DTS Scanner" defaultBinSize="day" />
    </DataProvider>
  );
}
