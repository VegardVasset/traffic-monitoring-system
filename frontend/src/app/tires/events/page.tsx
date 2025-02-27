"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";
import { DataProvider } from "@/context/DataContext";

export default function TiresEventsPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tires`;
  return (
    <DataProvider apiUrl={apiUrl} domain="tires">
      <EventTemplate domain="tires" />
    </DataProvider>
  );
}
