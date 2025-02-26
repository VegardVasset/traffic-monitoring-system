"use client";

import React from "react";

interface EventSummaryProps {
  count: number;
}

export default function EventSummary({ count }: EventSummaryProps) {
  return (
    <div className="text-left">
      {/* Just show the number */}
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}
