"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";
import { DataProvider } from "@/context/DataContext";
import AnomalyAlert from "@/components/alerts/tireAnomalyAlert";

export default function TiresEventsPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tires`;
  return (
    <DataProvider apiUrl={apiUrl} domain="tires">
      {/* Display anomaly alert for tire events */}
      <AnomalyAlert />
      <EventTemplate domain="tires" />
    </DataProvider>
  );
}
