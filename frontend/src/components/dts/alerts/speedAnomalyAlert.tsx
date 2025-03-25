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

export default function SpeedAnomalyAlert() {
  const { data } = useData();
  const [anomalies, setAnomalies] = useState<DtsEvent[]>([]);
  const [showPopup, setShowPopup] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const prevCountRef = useRef(0);

  // Define thresholds for abnormal speed.
  const speedLowThreshold = 20;
  const speedHighThreshold = 120;

  useEffect(() => {
    // First filter out events that are DtsEvents.
    const speedEvents = data.filter(isSpeedEvent);
    // Now filter for events with abnormal speed.
    const detected = speedEvents.filter(
      (event) => event.speed < speedLowThreshold || event.speed > speedHighThreshold
    );

    // If new anomalies are detected, update the alert message and show the popup.
    if (detected.length > prevCountRef.current && detected.length > 0) {
      const latest = detected[0];
      setAlertMessage(
        `Speed anomaly: Vehicle passed with an abnormal speed of ${latest.speed} km/h.`
      );
      setShowPopup(true);
    }

    prevCountRef.current = detected.length;
    setAnomalies(detected);
  }, [data]);

  if (anomalies.length === 0) return null;

  return (
    <>
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

      <div className="p-4 mb-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700 font-semibold">
          Speed Anomaly Detected: {anomalies.length} event
          {anomalies.length > 1 ? "s" : ""} with abnormal speed.
        </p>
      </div>
    </>
  );
}
