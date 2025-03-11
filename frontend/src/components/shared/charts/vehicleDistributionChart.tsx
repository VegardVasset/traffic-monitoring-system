"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; 
import type { ChartOptions } from "chart.js";
import { getChartColor } from "@/lib/chartUtils";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export interface Event {
  id: number;
  vehicleType: string;
}

export interface VehicleDistributionChartProps {
  data: Event[];
}

export default function VehicleDistributionChart({
  data,
}: VehicleDistributionChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH); 
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((event) => {
      counts[event.vehicleType] = (counts[event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data]);

  const labels = Object.keys(distribution);
  const values = labels.map((label) => distribution[label]);

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => getChartColor(i, 0.8)),
        },
      ],
    };
  }, [labels, values]);

  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false, 
    layout: {
      padding: {
        
      },
    },
    plugins: {
      legend: {
        display: false,
        position: "bottom",
        onClick: () => {}, 
        labels: {
          boxWidth: isMobile ? 6 : 12,
          font: {
            size: isMobile ? 6 : 14,
          },
        },
      },
     
      title: {
        display: false,
      },
      datalabels: {
        display: !isMobile,
        formatter: (value, context) => {
          const dataArr = context.chart.data.datasets[0].data as number[];
          const total = dataArr.reduce((acc, val) => acc + val, 0);
          const percentage = (((value as number) / total) * 100).toFixed(1) + "%";
          return percentage;
        },
        color: "white",
        font: {
          weight: "bold",
          size: isMobile ? 8 : 12,
        },
        anchor: "end",  
      align: "start", 
      offset: 60,    
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Vehicle Distribution
      </h2>
      <div className="flex-1 relative">
        <Pie data={chartData} options={pieChartOptions} />
      </div>
    </div>
  );
}
