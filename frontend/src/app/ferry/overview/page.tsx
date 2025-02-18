"use client";
import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function FerryOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="Ferry"
      apiUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ferry`}
      defaultBinSize="day"
    />
  );
}
