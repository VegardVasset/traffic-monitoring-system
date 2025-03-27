"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getChartColor } from "@/lib/chartUtils";

interface UnifiedLegendProps {
  vehicleTypes: string[];
}

export function UnifiedLegend({ vehicleTypes }: UnifiedLegendProps) {

  
  return (
    <Card className="p-2 mb-4">
      <div className="flex flex-wrap gap-1">
        {vehicleTypes.map((type, i) => {
          const color = getChartColor(i);
          return (
            <Badge
              key={type}
              className="px-2 py-1 text-[8px] sm:px-3 sm:py-1 sm:text-xs md:px-2 md:py-2 md:text-s"
              style={{
                backgroundColor: color,
                color: "#fff",
              }}
            >
              {type}
            </Badge>
          );
        })}
      </div>
    </Card>
  );
}
