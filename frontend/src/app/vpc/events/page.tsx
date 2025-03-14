"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";
import { DataProvider } from "@/context/DataContext";

export default function VPCEventsPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vpc`;
  return (
    <DataProvider apiUrl={apiUrl} domain="vpc">
      <EventTemplate domain="vpc" />
    </DataProvider>
  );
}
