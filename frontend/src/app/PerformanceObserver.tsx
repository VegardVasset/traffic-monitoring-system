// src/app/PerformanceObserver.tsx
"use client";

import { useAnalytics } from "@/context/AnalyticsContext";
import { useReportWebVitals } from "next/web-vitals";

export default function PerformanceObserver() {
  const { logEvent } = useAnalytics();

  useReportWebVitals((metric) => {
    // metric.name is e.g. "FCP", "LCP", "Next.js-hydration", etc.
    logEvent("Web Vitals", {
      name: metric.name,
      value: metric.value,
      label: metric.label,
    });
  });

  return null;
}
