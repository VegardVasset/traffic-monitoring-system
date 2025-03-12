"use client";

import React, { useMemo } from "react";
import { useAnalytics } from "@/context/analyticsContext";

export default function AnalyticsPage() {
  const { events } = useAnalytics();

  // Aggregate metrics for REST fetch durations
  const restFetchEvents = events.filter(
    (e) =>
      e.message === "REST fetch completed" &&
      e.data &&
      typeof (e.data as { fetchDuration?: number }).fetchDuration === "number"
  );
  const averageFetchDuration = useMemo(() => {
    if (restFetchEvents.length === 0) return 0;
    const total = restFetchEvents.reduce(
      (acc, curr) =>
        acc +
        ((curr.data as { fetchDuration: number }).fetchDuration || 0),
      0
    );
    return total / restFetchEvents.length;
  }, [restFetchEvents]);

  // Aggregate metrics for live mode latency events
  const liveLatencyEvents = events.filter(
    (e) =>
      e.message === "Live mode latency" &&
      e.data &&
      typeof (e.data as { latency?: number }).latency === "number"
  );
  const averageLiveLatency = useMemo(() => {
    if (liveLatencyEvents.length === 0) return 0;
    const total = liveLatencyEvents.reduce(
      (acc, curr) =>
        acc + ((curr.data as { latency: number }).latency || 0),
      0
    );
    return total / liveLatencyEvents.length;
  }, [liveLatencyEvents]);

  // Aggregate metrics for data arrival frequency events (per minute)
  const frequencyEvents = events.filter(
    (e) =>
      e.message === "Data arrival frequency" &&
      e.data &&
      typeof (e.data as { count?: number }).count === "number"
  );
  const averageDataFrequency = useMemo(() => {
    if (frequencyEvents.length === 0) return 0;
    const total = frequencyEvents.reduce(
      (acc, curr) =>
        acc + ((curr.data as { count: number }).count || 0),
      0
    );
    return total / frequencyEvents.length;
  }, [frequencyEvents]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Aggregated Metrics</h2>
        <ul className="list-disc ml-6">
          <li>
            Average REST Fetch Duration: {averageFetchDuration.toFixed(2)} ms
          </li>
          <li>
            Average Live Mode Latency: {averageLiveLatency.toFixed(2)} ms
          </li>
          <li>
            Average Data Arrival Frequency (per minute):{" "}
            {averageDataFrequency.toFixed(2)}
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Detailed Event Logs</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">Event Message</th>
              <th className="border p-2">Event Data</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td className="border p-2">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </td>
                <td className="border p-2">{event.message}</td>
                <td className="border p-2">
                  <pre className="text-xs">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
