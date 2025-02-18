"use client";

// DtsOverviewPage.tsx
import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function DtsOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="DTS Scanner"
      apiUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dts`}
      defaultBinSize="day"
    />
  );
}

