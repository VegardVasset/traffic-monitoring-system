
"use client";
import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function FerryEventsPage() {
  return (
    <EventTemplate
      domain="ferry"
      title="Ferry Counter"
      apiUrl="https://traffic-monitoring-system-production.up.railway.app/api/ferry"
    />
  );
}
