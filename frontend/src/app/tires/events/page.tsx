"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function TiresEventsPage() {
  return (
    <EventTemplate
      domain="tires"
      title="Tire Scanner"
      apiUrl="https://traffic-monitoring-system-production.up.railway.app/api/tires"
    />
  );
}

