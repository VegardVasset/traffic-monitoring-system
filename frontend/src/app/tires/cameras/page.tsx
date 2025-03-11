"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import CameraTemplate from "@/components/shared/pageTemplates/cameraTemplate";

export default function TiresCamerasPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tires`;

  return (
    <DataProvider apiUrl={apiUrl} domain="tires">
      <CameraTemplate domain="tires" />
    </DataProvider>
  );
}
