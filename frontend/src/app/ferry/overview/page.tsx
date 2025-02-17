"use client";

// FerryOverviewPage.tsx
import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function FerryOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="Ferry"
      apiUrl="https://traffic-monitoring-system-production.up.railway.app/api/ferry"
      defaultBinSize="day"
    />
  );
}

