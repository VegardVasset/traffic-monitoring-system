"use client";

import React, { useEffect, useRef, useState } from "react";
import { useData } from "@/context/DataContext";

// Extend the tire event type based on your MockRecord interface
interface TireEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType:
    | "buss"
    | "lastebil sylinder"
    | "person transport"
    | "camping kjøretøy"
    | "lett industri"
    | "tilhenger"
    | "lastebil åpen"
    | "motorsykkel"
    | "traktor"
    | "lastebil lukket"
    | "myke trafikanter"
    | "utrykningskjøretøy";
  camera: string;
  laneId: string;
  edgeId: string;
  imageUrl: string;
  confidenceScore: number;
  corrected: boolean;
  tireType?: "Sommerdekk" | "Vinterdekk";
  tireCondition?: number;
  passengerCount?: number;
}

function isTireEvent(event: unknown): event is TireEvent {
  return typeof (event as { tireCondition?: number }).tireCondition !== 'undefined';
}

const AnomalyAlert: React.FC = () => {
  const { data } = useData();
  const [anomalies, setAnomalies] = useState<TireEvent[]>([]);
  // State to control whether the popup modal is shown
  const [showPopup, setShowPopup] = useState<boolean>(true);
  // State to hold the alert message
  const [alertMessage, setAlertMessage] = useState<string>(
    `There ${anomalies.length > 1 ? 'are' : 'is'} ${anomalies.length} tire event${anomalies.length > 1 ? 's' : ''} with tire condition 1 or 2.`
  );

  // useRef to store previous anomaly count
  const prevCountRef = useRef<number>(0);

  useEffect(() => {
    // Filter tire events to detect anomalies where tireCondition is 1 or 2
    const detected = data
      .filter(isTireEvent)
      .filter(event => event.tireCondition === 1 || event.tireCondition === 2);

    // If new anomalies have been added, update the popup
    if (detected.length > prevCountRef.current) {
      setAlertMessage("Vehicle just passed with poor tires...");
      setShowPopup(true);
    }

    // Update previous count and anomalies state
    prevCountRef.current = detected.length;
    setAnomalies(detected);
  }, [data]);

  // If no anomalies, render nothing
  if (anomalies.length === 0) return null;

  return (
    <>
      {/* Popup modal alert - shown only when showPopup is true */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white p-6 rounded shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-red-700">
              Tire Anomaly Detected
            </h2>
            <p className="mb-4">
              {alertMessage}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Inline alert displayed as before */}
      <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded">
        <p className="text-red-700 font-semibold">
          Anomaly Detected: {anomalies.length} tire event
          {anomalies.length > 1 ? "s" : ""} with tire condition 1 or 2.
        </p>
      </div>
    </>
  );
};

export default AnomalyAlert;