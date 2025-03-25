"use client";

import AnalyticsProvider from "@/context/AnalyticsContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
