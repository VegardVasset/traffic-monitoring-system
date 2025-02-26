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
    <div className="flex flex-col gap-4 text-sm">
      {/* Start Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <Label htmlFor="startDate" className="whitespace-nowrap">
          Start
        </Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="w-full sm:w-[140px] h-8 text-sm mt-1 sm:mt-0"
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <Label htmlFor="endDate" className="whitespace-nowrap">
          End
        </Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="w-full sm:w-[140px] h-8 text-sm mt-1 sm:mt-0"
        />
      </div>
    </div>
  );
}
