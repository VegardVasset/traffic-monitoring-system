"use client";

import { useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import EventTable from "@/components/shared/eventTable";

const ferryCameras: Camera[] = [
  { id: "cam1", name: "Ferry Cam 1" },
  { id: "cam2", name: "Ferry Cam 2" },
];

export default function FerryPage() {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🚢 Ferry Counting</h1>
      <FilterComponent
        cameras={ferryCameras}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
      />
      <EventTable domain="ferry" selectedCamera={selectedCamera} />
    </div>
  );
}
