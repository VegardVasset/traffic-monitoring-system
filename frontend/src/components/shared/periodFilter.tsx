"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PeriodFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export default function PeriodFilter({
  startDate,
  endDate,
  onChange,
}: PeriodFilterProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(startDate, e.target.value);
  };

  return (
    <div className="text-xs">
      <div className="mb-1 font-bold">Date Range</div>

      {/* Row format: Start and End side by side */}
      <div className="flex flex-row flex-wrap gap-3">
        <div className="flex flex-row gap-1">
          <Label htmlFor="startDate" className="text-xs self-center">
            Start
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-[130px] h-7 text-xs"
          />
        </div>

        <div className="flex flex-row gap-1">
          <Label htmlFor="endDate" className="text-xs self-center">
            End
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-[130px] h-7 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
