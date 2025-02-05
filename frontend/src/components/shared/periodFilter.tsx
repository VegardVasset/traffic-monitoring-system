// components/PeriodFilter.tsx
import React from "react";

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
    <div className="flex items-center gap-4">
      <div>
        <label htmlFor="startDate" className="mr-2 font-medium">
          Start Date:
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="border rounded p-1"
        />
      </div>
      <div>
        <label htmlFor="endDate" className="mr-2 font-medium">
          End Date:
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="border rounded p-1"
        />
      </div>
    </div>
  );
}
