"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function TiresEventsPage() {
  return (
    <EventTemplate
      domain="tires"
      title="Tire Scanner"
      apiUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tires`}
    />
  );
}

