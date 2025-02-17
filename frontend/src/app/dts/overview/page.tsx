"use client";

// DtsOverviewPage.tsx
import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function DtsOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="DTS Scanner"
      apiUrl="https://traffic-monitoring-system-production.up.railway.app/api/dts"
      defaultBinSize="day"
    />
  );
}

