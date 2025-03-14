"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import CameraTemplate from "@/components/shared/pageTemplates/cameraTemplate";

export default function VPCCamerasPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vpc`;

  return (
    <DataProvider apiUrl={apiUrl} domain="vpc">
      <CameraTemplate domain="vpc" />
    </DataProvider>
  );
}
