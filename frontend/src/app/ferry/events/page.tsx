
"use client";
import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function FerryEventsPage() {
  return (
    <EventTemplate
      domain="ferry"
      title="Ferry Counter"
      apiUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ferry`}
    />
  );
}
