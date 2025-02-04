"use client";

import { useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import EventTable from "@/components/shared/eventTable";

// Provide a camera list for the DTS page.
const dtsCameras: Camera[] = [
  { id: "Os", name: "Os" },
  { id: "Hopseide", name: "Hopseide" },
  { id: "Gedjne", name: "Gedjne" },
];

// Reuse the same vehicle types list.
const vehicleTypes = [
  "person transport",
  "buss",
  "motorsykkel",
  "lastebil lukket",
  "lastebil åpen",
  "lett industri",
  "tilhenger",
  "camping kjøretøy",
  "utrykningskjøretøy",
  "lastebil sylinder",
  "myke trafikanter",
  "traktor",
];

export default function DtsPage() {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [isLive, setIsLive] = useState<boolean>(false); // NEW: Live toggle state

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Detailed Traffic Statistics
      </h1>
      <FilterComponent
        cameras={dtsCameras}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        vehicleTypes={vehicleTypes}
        selectedVehicleType={selectedVehicleType}
        setSelectedVehicleType={setSelectedVehicleType}
        isLive={isLive}             // NEW: Pass live state
        setIsLive={setIsLive}       // NEW: Pass state updater
      />
      <EventTable
        domain="dts"  // Ensure your backend handles the "dts" endpoint or adjust as needed.
        selectedCamera={selectedCamera}
        selectedVehicleType={selectedVehicleType}
        isLive={isLive}             // NEW: Pass live state to control WebSocket/backlog behavior
      />
    </div>
  );
}
