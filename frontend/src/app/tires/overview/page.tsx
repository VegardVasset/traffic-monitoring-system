"use client";

import React from "react";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

export default function TiresOverviewPage() {
  return (
    <OverviewTemplate
      domainTitle="Tire Scanner"
      apiUrl="http://localhost:4000/api/tires"
      defaultBinSize="day"
    />
  );
}
