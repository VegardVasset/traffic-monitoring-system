"use client";

import AnalyticsProvider from "@/context/AnalyticsContext";
import PerformanceObserver from "./PerformanceObserver";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      <PerformanceObserver />

      {children}
    </AnalyticsProvider>
  );
}
