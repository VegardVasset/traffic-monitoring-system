"use client";

import React, { useMemo } from "react";
import { useData } from "@/context/DataContext";

// Reuse the same table components you used for events:
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface CameraTemplateProps {
  domain: string;
}

export default function CameraTemplate({ domain }: CameraTemplateProps) {
  const { data, loading, error } = useData();

  // Get the unique camera names from the data
  const uniqueCameras = useMemo(() => {
    const cameraSet = new Set<string>();
    data.forEach((event) => {
      if (event.camera) {
        cameraSet.add(event.camera);
      }
    });
    return Array.from(cameraSet);
  }, [data]);

  if (loading) {
    return <p className="text-gray-500">Loading cameras...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">
        {domain.toUpperCase()} Cameras
      </h1>

      {/* Simple table with one column for camera names */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Camera Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueCameras.length === 0 ? (
            <TableRow>
              <TableCell>No cameras found.</TableCell>
            </TableRow>
          ) : (
            uniqueCameras.map((camera) => (
              <TableRow key={camera} className="hover:bg-gray-200">
                <TableCell>{camera}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
