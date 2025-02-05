// components/EventSummary.tsx
import React from "react";

interface EventSummaryProps {
  count: number;
  startDate: string;
  endDate: string;
}

export default function EventSummary({
  count,
  startDate,
  endDate,
}: EventSummaryProps) {
  return (
    <div className="mt-4">
      <p className="text-lg font-semibold">
        Total events from {startDate} to {endDate}: {count}
      </p>
    </div>
  );
}
