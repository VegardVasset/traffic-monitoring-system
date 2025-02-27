"use client";

import React from "react";

interface EventSummaryProps {
  count: number;
}

export default function EventSummary({ count }: EventSummaryProps) {
  return (
    <div className="text-xs">
      <div className="mb-1 font-bold">Passings for chosen period</div>
      <p className="text-left text-xl font-bold">{count}</p>
    </div>
  );
}
