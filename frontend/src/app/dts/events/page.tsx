"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function DtsEventsPage() {
  return (
    <EventTemplate
      domain="dts"
      title="Detailed Traffic Statistics"
      apiUrl="http://localhost:4000/api/dts"
    />
  );
}
