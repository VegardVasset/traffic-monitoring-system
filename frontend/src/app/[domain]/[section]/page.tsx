"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import CameraTemplate from "@/components/shared/pageTemplates/CameraTemplate";
import PassingsTemplate from "@/components/shared/pageTemplates/PassingsTemplate";
import OverviewTemplate from "@/components/shared/pageTemplates/OverviewTemplate";
import AnomalyAlert from "@/components/tires/alerts/TireAnomalyAlert";
import SpeedAnomalyAlert from "@/components/dts/alerts/SpeedAnomalyAlert";

// Create a wrapper for passings that conditionally shows AnomalyAlerts
const PassingsWrapper: React.FC<{ domain: string }> = ({ domain }) => {
    return (
      <>
        {domain === "tires" && <AnomalyAlert />}
        {domain === "dts" && <SpeedAnomalyAlert />}
        <PassingsTemplate domain={domain} />
      </>
    );
  };

// Map sections to their respective components.
const SECTION_COMPONENTS: Record<string, React.FC<{ domain: string }>> = {
  overview: OverviewTemplate,
  passings: PassingsWrapper,
  cameras: CameraTemplate,
};

export default function DomainSectionPage() {
  const { domain, section } = useParams() as {
    domain: string;
    section: string;
  };

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${domain}`;
  const SectionComponent = SECTION_COMPONENTS[section];

  return (
    <DataProvider apiUrl={apiUrl} domain={domain}>
      {SectionComponent ? (
        <SectionComponent domain={domain} />
      ) : (
        <p>Invalid section: {section}</p>
      )}
    </DataProvider>
  );
}