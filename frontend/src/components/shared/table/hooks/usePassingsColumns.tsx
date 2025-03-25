import { useCallback } from "react";
import Image from "next/image"; // Import Next.js Image component
import { ColumnDef } from "@tanstack/react-table";
import { BaseEvent } from "@/context/DataContext";
import { Button } from "@/components/ui/button";

interface UsePassingsColumnsProps {
  domain: string;
  onEdit: (event: BaseEvent) => void;
}

export function usePassingsColumns({ domain, onEdit }: UsePassingsColumnsProps): ColumnDef<BaseEvent>[] {
  const getColumns = useCallback((): ColumnDef<BaseEvent>[] => {
    const baseColumns: ColumnDef<BaseEvent>[] = [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "creationTime",
        header: "Time",
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      },
      { accessorKey: "vehicleType", header: "Vehicle Type" },
      { accessorKey: "camera", header: "Camera" },
      {
        accessorKey: "confidenceScore",
        header: "Confidence",
        cell: (info) => {
          const value = info.getValue() as number;
          return `${(value * 100).toFixed(2)}%`;
        },
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: (info) => {
          // Convert full URL to a relative path if it starts with "http://localhost:3000"
          const fullUrl = info.getValue() as string;
          const relativeUrl = fullUrl.startsWith("http://localhost:3000")
            ? fullUrl.replace("http://localhost:3000", "")
            : fullUrl;
          return (
            <Image
              src={relativeUrl}
              alt="Vehicle"
              width={120} // Adjust as needed
              height={120} // Adjust as needed
              style={{ objectFit: "cover" }}
            />
          );
        },
      }
      
    ];

    if (domain === "tires") {
      baseColumns.push(
        {
          accessorKey: "tireType",
          header: "Tire Type",
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessorKey: "tireCondition",
          header: "Tire Condition (1-5)",
          cell: (info) => info.getValue() || "N/A",
        }
      );
    }

    if (domain === "vpc") {
      baseColumns.push({
        accessorKey: "passengerCount",
        header: "Passenger Count",
        cell: (info) => info.getValue() || "N/A",
      });
    }

    if (domain === "dts") {
      baseColumns.push({
        accessorKey: "speed",
        header: "Speed (km/h)",
        cell: (info) => info.getValue() || "N/A",
      });
    }

    // Actions column for editing
    baseColumns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(event)}
            aria-label={`Edit event ${event.id}`}
          >
            Correct
          </Button>
        );
      },
    });

    return baseColumns;
  }, [domain, onEdit]);

  return getColumns();
}
