"use client";

import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PeriodFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export default function PeriodFilter({ startDate, endDate, onChange }: PeriodFilterProps) {
  const handleDateChange = useCallback(
    (field: "startDate" | "endDate") => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "startDate") {
        onChange(e.target.value, endDate);
      } else {
        onChange(startDate, e.target.value);
      }
    },
    [onChange, startDate, endDate]
  );

  return (
    <div className="text-xs">
      <div className="mb-1 font-bold">Date Range</div>
      <div className="flex flex-row flex-wrap gap-3">
        <div className="flex flex-row gap-1">
          <Label htmlFor="startDate" className="text-xs self-center">
            Start
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleDateChange("startDate")}
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
            onChange={handleDateChange("endDate")}
            className="w-[130px] h-7 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
