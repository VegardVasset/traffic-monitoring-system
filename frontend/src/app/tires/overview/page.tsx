"use client";

// TiresOverviewPage.tsx
import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function TiresOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="Tire Scanner"
      apiUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ferry`}
      defaultBinSize="day"
    />
  );
}

