"use client";

import React, { useEffect, useMemo, useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components (if not already registered globally)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Event {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
  // ... other fields as needed
}

// These arrays come from your shared filter settings.
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

const cameras: Camera[] = [
  { id: "Os", name: "Os" },
  { id: "Hopseide", name: "Hopseide" },
  { id: "Gedjne", name: "Gedjne" },
];

export default function DtsOverviewPage() {
  // States from the filter component for camera and vehicle type.
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [isLive, setIsLive] = useState<boolean>(false);

  // State for the period filter (defaults to one month ago until today).
  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // Data state for events (fetched from your backend).
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the mock data from the API.
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:4000/api/dts");
        if (!res.ok) throw new Error("Failed to fetch data");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching overview data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isLive]);

  // Handle period changes from the PeriodFilter.
  const handlePeriodChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Filter data based on selected camera, vehicle type, and period.
  const filteredData = useMemo(() => {
    return data.filter((event) => {
      const eventDate = event.creationTime.substring(0, 10);
      const afterStart = eventDate >= startDate;
      const beforeEnd = eventDate <= endDate;
      const matchCamera =
        selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleType === "all" ||
        event.vehicleType === selectedVehicleType;
      return afterStart && beforeEnd && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleType, startDate, endDate]);

  if (loading) return <p className="text-gray-500">Loading overview data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">DTS Overview</h1>

      {/* Camera and vehicle type filters */}
      <FilterComponent
        cameras={cameras}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        vehicleTypes={vehicleTypes}
        selectedVehicleType={selectedVehicleType}
        setSelectedVehicleType={setSelectedVehicleType}
        isLive={isLive}
        setIsLive={setIsLive}
      />

      {/* Period filter */}
      <div className="mt-6">
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handlePeriodChange}
        />
      </div>

      {/* Event summary */}
      <EventSummary
        count={filteredData.length}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Visualizations */}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart Container */}
        <div className="bg-white shadow rounded-lg p-4">
          <TimeSeriesChart data={filteredData} vehicleTypes={vehicleTypes} />
        </div>

        {/* Vehicle Distribution Chart Container */}
        <div className="bg-white shadow rounded-lg p-4">
          <VehicleDistributionChart data={filteredData} />
        </div>
      </div>
    </div>
  );
}
