"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import CameraTemplate from "@/components/shared/pageTemplates/cameraTemplate";
import EventTemplate from "@/components/shared/pageTemplates/eventTemplate";
import OverviewTemplate from "@/components/shared/pageTemplates/overviewTemplate";

// Map sections to their respective components. Now 'overview' is included.
const SECTION_COMPONENTS: Record<string, React.FC<{ domain: string }>> = {
  overview: OverviewTemplate,
  cameras: CameraTemplate,
  events: EventTemplate,
};

export default function MonitoringSectionPage() {
  const { monitoring, section } = useParams() as {
    monitoring: string;
    section: string;
  };

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${monitoring}`;
  const SectionComponent = SECTION_COMPONENTS[section];

  return (
    <DataProvider apiUrl={apiUrl} domain={monitoring}>
      {SectionComponent ? (
        <SectionComponent domain={monitoring} />
      ) : (
        <p>Invalid section: {section}</p>
      )}
    </DataProvider>
  );
}