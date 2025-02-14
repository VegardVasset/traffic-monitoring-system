"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function TiresEventsPage() {
  return (
    <EventTemplate
      domain="tires"
      title="Tire Scanner"
      apiUrl="http://localhost:4000/api/tires"
    />
  );
}
