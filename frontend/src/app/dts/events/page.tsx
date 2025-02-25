"use client";
import React from "react";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";

export default function DtsEventsPage() {
  return (
    <EventTemplate
      domain="dts"
      apiUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dts`}
    />
  );
}
