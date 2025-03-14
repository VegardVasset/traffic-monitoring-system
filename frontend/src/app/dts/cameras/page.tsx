"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import CameraTemplate from "@/components/shared/pageTemplates/cameraTemplate";

export default function DtsCamerasPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dts`;

  return (
    <DataProvider apiUrl={apiUrl} domain="dts">
      <CameraTemplate domain="dts" />
    </DataProvider>
  );
}
