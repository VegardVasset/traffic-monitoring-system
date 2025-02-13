"use client";

import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function DtsOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="DTS Scanner"
      apiUrl="http://localhost:4000/api/dts"
      defaultBinSize="day"
    />
  );
}
