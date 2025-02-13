"use client";

import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function FerryEventsPage() {
  return (
    <EventTemplate
      domain="ferry"
      title="Ferry Counter"
      apiUrl="http://localhost:4000/api/ferry"
    />
  );
}
