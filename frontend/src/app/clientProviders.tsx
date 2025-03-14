"use client";

import AnalyticsProvider from "@/context/analyticsContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
