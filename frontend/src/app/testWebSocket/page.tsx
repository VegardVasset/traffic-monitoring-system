"use client";

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

interface Record {
  id: number;
  creationTime: string;
  receptionTime: string;
  eventType: string;
  laneId: string;
  edgeId: string;
  imageUrl: string;
  confidenceScore: number;
  corrected: boolean;
}

const TestWebSocket = () => {
  const [ferryRecords, setFerryRecords] = useState<Record[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket Server");
    });

    // Handle initial data
    socket.on("initialData", (data) => {
      setFerryRecords(data.ferry); // Only fetch ferry data
    });

    // Handle new data
    socket.on("newData", (data) => {
      setFerryRecords((prev) => [...prev, data.ferry]); // Add new ferry record
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket Server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ferry Records</h1>
      <table className="table-auto border-collapse border border-gray-400 w-full text-left">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">ID</th>
            <th className="border border-gray-400 px-4 py-2">Event Type</th>
            <th className="border border-gray-400 px-4 py-2">Lane ID</th>
            <th className="border border-gray-400 px-4 py-2">Edge ID</th>
            <th className="border border-gray-400 px-4 py-2">Created</th>
            <th className="border border-gray-400 px-4 py-2">Received</th>
            <th className="border border-gray-400 px-4 py-2">Confidence</th>
            <th className="border border-gray-400 px-4 py-2">Corrected</th>
          </tr>
        </thead>
        <tbody>
          {ferryRecords.map((record) => (
            <tr key={record.id}>
              <td className="border border-gray-400 px-4 py-2">{record.id}</td>
              <td className="border border-gray-400 px-4 py-2">{record.eventType}</td>
              <td className="border border-gray-400 px-4 py-2">{record.laneId}</td>
              <td className="border border-gray-400 px-4 py-2">{record.edgeId}</td>
              <td className="border border-gray-400 px-4 py-2">{record.creationTime}</td>
              <td className="border border-gray-400 px-4 py-2">{record.receptionTime}</td>
              <td className="border border-gray-400 px-4 py-2">{record.confidenceScore.toFixed(2)}</td>
              <td className="border border-gray-400 px-4 py-2">{record.corrected ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestWebSocket;
