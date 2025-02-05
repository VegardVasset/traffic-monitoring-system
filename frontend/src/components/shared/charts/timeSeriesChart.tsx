// components/charts/TimeSeriesChart.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { ChartData } from "chart.js";

export interface Event {
  id: number;
  creationTime: string;
  vehicleType: string;
  // add other fields as needed
}

export interface TimeSeriesChartProps {
  data: Event[];
  vehicleTypes: string[]; // list of all possible vehicle types
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, vehicleTypes }) => {
  // Maintain state to track which vehicle types are toggled on.
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    vehicleTypes.forEach((type) => {
      initial[type] = true;
    });
    return initial;
  });

  // Get all unique dates (in "YYYY-MM-DD" format) present in the data.
  const allDates = useMemo(() => {
    const dateSet = new Set<string>();
    data.forEach((event) => {
      const date = event.creationTime.substring(0, 10);
      dateSet.add(date);
    });
    const dates = Array.from(dateSet);
    dates.sort();
    return dates;
  }, [data]);

  // For each vehicle type, create a dataset with counts per day.
  const datasets = useMemo(() => {
    return vehicleTypes.map((type, index) => {
      const counts = allDates.map((date) => {
        return data.filter(
          (event) =>
            event.vehicleType === type && event.creationTime.substring(0, 10) === date
        ).length;
      });
      return {
        label: type,
        data: counts,
        borderColor: getColor(index),
        backgroundColor: getColor(index, 0.5),
        hidden: !enabledTypes[type],
        fill: false,
      };
    });
  }, [data, allDates, vehicleTypes, enabledTypes]);

  // Prepare the chart data.
  const chartData: ChartData<"line"> = {
    labels: allDates,
    datasets: datasets,
  };

  // Utility: Get a color from a preset palette.
  function getColor(index: number, opacity: number = 1) {
    const colors = [
      `rgba(75,192,192,${opacity})`,
      `rgba(255,99,132,${opacity})`,
      `rgba(54,162,235,${opacity})`,
      `rgba(255,206,86,${opacity})`,
      `rgba(153,102,255,${opacity})`,
      `rgba(255,159,64,${opacity})`,
      `rgba(199,199,199,${opacity})`,
      `rgba(83,102,255,${opacity})`,
      `rgba(255,102,102,${opacity})`,
      `rgba(102,255,102,${opacity})`,
    ];
    return colors[index % colors.length];
  }



  return (
    <div>
     
      
      {/* Wrap the chart in a responsive container */}
      <div className="relative w-full" style={{ height: "400px" }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false, // Disable the aspect ratio to allow custom sizing
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Events Over Time by Vehicle Type" },
            },
          }}
        />
      </div>
    </div>
  );
};

export default TimeSeriesChart;
