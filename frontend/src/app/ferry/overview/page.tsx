"use client";

import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function FerryOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="Ferry"
      apiUrl="http://localhost:4000/api/ferry"
      defaultBinSize="day"
    />
  );
}
