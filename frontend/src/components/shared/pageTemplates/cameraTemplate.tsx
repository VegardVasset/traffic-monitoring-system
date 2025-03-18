"use client";

import React, { useMemo, useState} from "react";
import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import GeocodedMiniMap from "@/components/map/GeocodeMiniMap";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components with SSR disabled.
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);


interface LargeMapModalProps {
  center: { lat: number; lng: number };
  onClose: () => void;
}

const LargeMapModal = ({ center, onClose }: LargeMapModalProps) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
    onClick={onClose}
  >
    <div
      className="relative bg-white rounded w-[90vw] h-[80vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom={true}
        className="z-0"
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[center.lat, center.lng]} />
      </MapContainer>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 bg-blue-500 text-white py-1 px-2 rounded z-[9999]"
      >
        Close
      </button>
    </div>
  </div>
);

interface CameraRow {
  cameraName: string;
  passings: number;
}

interface CameraTemplateProps {
  domain: string;
}

export default function CameraTemplate({ domain }: CameraTemplateProps) {
  const { data, loading, error } = useData();
  const [selectedLocation, setSelectedLocation] =
    useState<{ lat: number; lng: number } | null>(null);

  // Aggregate cameras + passings count.
  const cameraRows: CameraRow[] = useMemo(() => {
    // Build a map: cameraName -> passings.
    const cameraMap = new Map<string, number>();

    data.forEach((event) => {
      if (event.camera) {
        const currentCount = cameraMap.get(event.camera) || 0;
        cameraMap.set(event.camera, currentCount + 1);
      }
    });

    // Convert to an array of {cameraName, passings}.
    return Array.from(cameraMap.entries()).map(([cameraName, passings]) => ({
      cameraName,
      passings,
    }));
  }, [data]);

  if (loading) return <p className="text-gray-500">Loading cameras…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Cameras
      </h1>
      <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Camera Name</TableHead>
              <TableHead>Passings</TableHead>
              <TableHead>Location Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cameraRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No cameras found.</TableCell>
              </TableRow>
            ) : (
              cameraRows.map(({ cameraName, passings }) => (
                <TableRow key={cameraName} className="hover:bg-gray-200">
                  <TableCell>{cameraName}</TableCell>
                  <TableCell>{passings}</TableCell>
                  <TableCell>
                    <GeocodedMiniMap
                      cameraName={cameraName}
                      onClick={(coords) => setSelectedLocation(coords)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLocation && (
        <LargeMapModal
          center={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}
