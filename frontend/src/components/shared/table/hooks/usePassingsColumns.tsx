import { useCallback } from "react";
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
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleString(),
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
        cell: (info) => (
          <img
            src={info.getValue() as string}
            alt="Vehicle"
            width="120"
            style={{ objectFit: "cover" }}
          />
        ),
      },
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
