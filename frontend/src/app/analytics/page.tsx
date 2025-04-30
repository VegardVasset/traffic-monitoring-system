"use client";

import React, { useMemo } from "react";
import { useAnalytics } from "@/context/AnalyticsContext";
import type { AnalyticsEvent } from "@/context/AnalyticsContext";

// Type guards without explicit any
function hasFetchDuration(e: AnalyticsEvent): e is AnalyticsEvent & { data: { fetchDuration: number } } {
  if (e.message !== "REST fetch completed" || e.data == null) return false;
  const d = e.data as Record<string, unknown>;
  return typeof d.fetchDuration === "number";
}

function hasLatency(e: AnalyticsEvent): e is AnalyticsEvent & { data: { latency: number } } {
  if (e.message !== "Live mode latency" || e.data == null) return false;
  const d = e.data as Record<string, unknown>;
  return typeof d.latency === "number";
}

function hasMountDuration(e: AnalyticsEvent): e is AnalyticsEvent & { data: { duration: string } } {
  if (e.message !== "Component mount time" || e.data == null) return false;
  const d = e.data as Record<string, unknown>;
  return typeof d.duration === "string";
}

function hasWebVital(e: AnalyticsEvent): e is AnalyticsEvent & { data: { name: string; value: number } } {
  if (e.message !== "Web Vitals" || e.data == null) return false;
  const d = e.data as Record<string, unknown>;
  return typeof d.name === "string" && typeof d.value === "number";
}

export default function AnalyticsPage() {
  const { events } = useAnalytics();

  // REST fetch metric
  const restFetchEvents = events.filter(hasFetchDuration);
  const averageFetch = useMemo(() => {
    if (!restFetchEvents.length) return 0;
    const total = restFetchEvents.reduce((sum, e) => sum + e.data.fetchDuration, 0);
    return total / restFetchEvents.length;
  }, [restFetchEvents]);

  // Live mode latency metric
  const liveLatencyEvents = events.filter(hasLatency);
  const averageLatency = useMemo(() => {
    if (!liveLatencyEvents.length) return 0;
    const total = liveLatencyEvents.reduce((sum, e) => sum + e.data.latency, 0);
    return total / liveLatencyEvents.length;
  }, [liveLatencyEvents]);

  // Component mount metric
  const mountEvents = events.filter(hasMountDuration);
  const averageMount = useMemo(() => {
    if (!mountEvents.length) return 0;
    const total = mountEvents.reduce((sum, e) => sum + parseFloat(e.data.duration), 0);
    return total / mountEvents.length;
  }, [mountEvents]);

  // Web Vitals: latest per metric
  const vitalsEvents = events.filter(hasWebVital);
  const vitalsMap = useMemo(() => {
    const map: Record<string, number> = {};
    vitalsEvents.forEach(e => {
      map[e.data.name] = e.data.value;
    });
    return map;
  }, [vitalsEvents]);

  // Descriptions for Web Vitals
  const vitalDescriptions: Record<string, string> = {
    TTFB: "Time To First Byte",
    FCP: "First Contentful Paint",
    LCP: "Largest Contentful Paint",
    FID: "First Input Delay",
    INP: "Interaction to Next Paint",
    CLS: "Cumulative Layout Shift",
  };

  // Format values
  const formatValue = (metric: string, val: number) =>
    metric === "CLS" ? val.toFixed(3) : `${val.toFixed(2)} ms`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Aggregated Metrics</h2>
        <table className="w-auto bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Metric</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border-l border-gray-300">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2 text-sm">Average REST Fetch Duration</td>
              <td className="px-4 py-2 text-sm text-right border-l border-gray-300">{formatValue("Fetch", averageFetch)}</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 text-sm">Average Live Mode Latency</td>
              <td className="px-4 py-2 text-sm text-right border-l border-gray-300">{formatValue("Latency", averageLatency)}</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 text-sm">Average Component Mount Time</td>
              <td className="px-4 py-2 text-sm text-right border-l border-gray-300">{formatValue("Mount", averageMount)}</td>
            </tr>
            {Object.entries(vitalsMap).map(([metric, val]) => (
              <tr key={metric} className="border-t">
                <td className="px-4 py-2 text-sm">{metric} ({vitalDescriptions[metric] || metric})</td>
                <td className="px-4 py-2 text-sm text-right border-l border-gray-300">{formatValue(metric, val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Detailed Event Logs</h2>
        <div className="overflow-auto max-h-64 border rounded-lg w-auto">
          <table className="border-collapse w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-3 py-2 text-left text-xs font-medium text-gray-600">Timestamp</th>
                <th className="border px-3 py-2 text-left text-xs font-medium text-gray-600">Event</th>
                <th className="border px-3 py-2 text-left text-xs font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border px-3 py-1 text-xs">{new Date(e.timestamp).toLocaleTimeString()}</td>
                  <td className="border px-3 py-1 text-xs">{e.message}</td>
                  <td className="border px-3 py-1 text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(e.data, null, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
