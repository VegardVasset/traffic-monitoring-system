"use client";

import React, { useEffect, useRef, useState } from "react";
import { useData, BaseEvent } from "@/context/DataContext";

// Extend BaseEvent with a speed property for DTS events
interface DtsEvent extends BaseEvent {
  speed: number;
}

// Type guard: check if the event is a DtsEvent (has a numeric speed property)
function isSpeedEvent(event: BaseEvent): event is DtsEvent {
    return "speed" in event && typeof (event as { speed?: unknown }).speed === "number";
  }

const SpeedAnomalyAlert: React.FC = () => {
  const { data } = useData();
  const [anomalies, setAnomalies] = useState<DtsEvent[]>([]);
  // State to control whether the popup modal is shown
  const [showPopup, setShowPopup] = useState<boolean>(true);
  // State to hold the alert message
  const [alertMessage, setAlertMessage] = useState<string>("");
  // useRef to store previous anomaly count
  const prevCountRef = useRef<number>(0);

  // Define thresholds for abnormal speed based on the getRandomSpeed function
  const speedLowThreshold = 20;
  const speedHighThreshold = 120;

  useEffect(() => {
    // Filter events from data that are DTS events with a speed property and check for anomalies
    const detected = data
      .filter(isSpeedEvent)
      .filter(event => event.speed < speedLowThreshold || event.speed > speedHighThreshold);

    // If new anomalies have been added, update the popup message and show the popup
    if (detected.length > prevCountRef.current && detected.length > 0) {
      // Use the first anomaly's speed for the message
      const latest = detected[0];
      setAlertMessage(`Speed anomaly: Vehicle passed with an abnormal speed of ${latest.speed} km/h.`);
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
            <h2 className="text-xl font-bold mb-4 text-green-700">
              Speed Anomaly Detected
            </h2>
            <p className="mb-4">{alertMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Inline alert displayed as before */}
      <div className="p-4 mb-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700 font-semibold">
          Speed Anomaly Detected: {anomalies.length} event{anomalies.length > 1 ? "s" : ""} with abnormal speed.
        </p>
      </div>
    </>
  );
};

export default SpeedAnomalyAlert;