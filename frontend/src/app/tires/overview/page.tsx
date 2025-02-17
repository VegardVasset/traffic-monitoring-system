"use client";

// TiresOverviewPage.tsx
import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function TiresOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="Tire Scanner"
      apiUrl="https://traffic-monitoring-system-production.up.railway.app/api/tires"
      defaultBinSize="day"
    />
  );
}

