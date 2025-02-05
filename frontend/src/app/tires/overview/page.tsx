"use client";

import React, { useEffect, useMemo, useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import { Bar, Line, Pie } from "react-chartjs-2";
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

// Register Chart.js components
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
  // ... other fields
}

// These arrays come from your existing FilterComponent setup.
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
  { id: "Bergen Parkering", name: "Bergen Parkering" },
  { id: "Oslo Parkering", name: "Oslo Parkering" },
  { id: "Vardø", name: "Vardø" },
];

export default function TiresOverviewPage() {
  // States from your original FilterComponent for camera and vehicle type
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [isLive, setIsLive] = useState<boolean>(false);

  // State for the period filter (defaulting to a recent period)
  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(
    new Date().setMonth(new Date().getMonth() - 1)
  )
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // Chart type state: "bar" or "line"
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Data state for events (fetched from backend)
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the mock data from the API.
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:4000/api/tires");
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

  // Update period filter
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

  // Aggregate data: Count events per day.
  const eventsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((event) => {
      const date = event.creationTime.substring(0, 10);
      counts[date] = (counts[date] || 0) + 1;
    });
    const labels = Object.keys(counts).sort();
    const values = labels.map((label) => counts[label]);
    return { labels, values };
  }, [filteredData]);

  // Aggregate data: Vehicle type distribution for the pie chart.
  const vehicleTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((event) => {
      counts[event.vehicleType] = (counts[event.vehicleType] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const values = labels.map((label) => counts[label]);
    return { labels, values };
  }, [filteredData]);

  if (loading) return <p className="text-gray-500">Loading overview data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tire Scanner Overview</h1>

      {/* Reuse the camera and vehicle type filter */}
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
      <EventSummary count={filteredData.length} startDate={startDate} endDate={endDate} />

      {/* Chart Toggle */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => setChartType("bar")}
          className={`px-4 py-2 rounded border ${
            chartType === "bar" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType("line")}
          className={`px-4 py-2 rounded border ${
            chartType === "line" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Line Chart
        </button>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart: Number of Events per Day (Bar or Line based on chartType) */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Events Per Day</h3>
          {chartType === "bar" ? (
            <Bar
              data={{
                labels: eventsPerDay.labels,
                datasets: [
                  {
                    label: "Number of Events",
                    data: eventsPerDay.values,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false, text: "Events Per Day" },
                },
              }}
            />
          ) : (
            <Line
              data={{
                labels: eventsPerDay.labels,
                datasets: [
                  {
                    label: "Number of Events",
                    data: eventsPerDay.values,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false, text: "Events Per Day" },
                },
              }}
            />
          )}
        </div>

        {/* Pie Chart: Distribution of Vehicle Types */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Vehicle Type Distribution</h3>
          <Pie
            data={{
              labels: vehicleTypeCounts.labels,
              datasets: [
                {
                  label: "Vehicle Types",
                  data: vehicleTypeCounts.values,
                  backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                    "#C9CBCF",
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                title: { display: false },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
