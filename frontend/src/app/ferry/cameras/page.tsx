"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import CameraTemplate from "@/components/shared/pageTemplates/cameraTemplate";

export default function FerryCamerasPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ferry`;

  return (
    <DataProvider apiUrl={apiUrl} domain="ferry">
      <CameraTemplate domain="ferry" />
    </DataProvider>
  );
}
