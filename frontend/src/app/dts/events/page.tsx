"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";
import { DataProvider } from "@/context/DataContext";
import SpeedAnomalyAlert from "@/components/alerts/speedAnomalyAlert";

export default function DTSEventsPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dts`;
  return (
    <DataProvider apiUrl={apiUrl} domain="dts">
      {/* Display speed anomaly alert for DTS events */}
      <SpeedAnomalyAlert />
      <EventTemplate domain="dts" />
    </DataProvider>
  );
}
