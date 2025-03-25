"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useData, BaseEvent } from "@/context/DataContext";
import { useAnalytics } from "@/context/analyticsContext";
import EditDialog from "./editDialog";

interface PassingsTableProps {
  domain: string;
  selectedCamera: string;
  selectedVehicleTypes: string[];
}

export default function PassingsTable({
  domain,
  selectedCamera,
  selectedVehicleTypes,
}: PassingsTableProps) {
  const { data, loading, error, lastUpdateArrivalTime, updateEvent } =
    useData();
  const { logEvent } = useAnalytics();

  // Filter based on user selection using context data directly
  const filteredData: BaseEvent[] = useMemo(() => {
    let dataArr = data;
    if (selectedCamera !== "all") {
      dataArr = dataArr.filter((record) => record.camera === selectedCamera);
    }
    if (selectedVehicleTypes.length > 0) {
      dataArr = dataArr.filter((record) =>
        selectedVehicleTypes.includes(record.vehicleType)
      );
    }
    return dataArr;
  }, [data, selectedCamera, selectedVehicleTypes]);

  // Log live mode latency
  const lastLoggedArrivalRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      lastUpdateArrivalTime &&
      lastUpdateArrivalTime !== lastLoggedArrivalRef.current
    ) {
      const now = performance.now();
      const latency = now - lastUpdateArrivalTime;
      logEvent("Live mode latency", {
        latency,
        dataLength: filteredData.length,
      });
      console.log(`Live mode latency: ${latency.toFixed(2)} ms`);
      lastLoggedArrivalRef.current = lastUpdateArrivalTime;
    }
  }, [filteredData, lastUpdateArrivalTime, logEvent]);

  // React Table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BaseEvent | null>(null);

  // Callback to open edit dialog
  const handleEdit = useCallback((event: BaseEvent) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  }, []);

  // Compute unique vehicle types from context data
  const uniqueVehicleTypes = useMemo((): string[] => {
    const types = new Set(data.map((e) => e.vehicleType));
    return Array.from(types);
  }, [data]);

  // Define columns for the table
  const getColumns = useCallback(
    (domain: string): ColumnDef<BaseEvent>[] => {
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
            <div style={{ width: 120, height: 80, position: "relative" }}>
              <Image
                src={info.getValue() as string}
                alt="Vehicle"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
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
            <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
              Correct
            </Button>
          );
        },
      });

      return baseColumns;
    },
    [handleEdit]
  );

  const columns = useMemo(() => getColumns(domain), [domain, getColumns]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: { columnFilters, columnVisibility, pagination },
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    manualPagination: false,
    getRowId: (row: BaseEvent) => row.id.toString(),
    enableRowSelection: true,
  });

  if (loading) {
    return <p className="text-gray-500">Loading events...</p>;
  }
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <>
      <div className="w-full bg-white shadow rounded-lg">
        {/* Table header with column visibility options */}
        <div className="flex items-center py-1 sm:py-4 px-1 sm:px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto text-xs px-2">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <Table className="w-full table-auto border-collapse border border-gray-300">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gray-100 border-b border-gray-300"
                >
                  {headerGroup.headers.map((header) => {
                    const sorting = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="cursor-pointer text-xs sm:text-sm md:text-base p-1 sm:p-2 whitespace-nowrap border-r last:border-r-0 border-gray-300"
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="ml-1 inline-block">
                              {sorting === "asc" ? (
                                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              ) : sorting === "desc" ? (
                                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-200 text-xs sm:text-sm md:text-base border-b border-gray-300"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-1 sm:p-2 border-r last:border-r-0 border-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 sm:items-center p-2 sm:p-4 text-xs sm:text-sm">
          <div className="text-muted-foreground">
            {filteredData.length} row(s).
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 px-2 sm:h-8 sm:px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 px-2 sm:h-8 sm:px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && selectedEvent && (
        <EditDialog
          event={selectedEvent}
          uniqueVehicleTypes={uniqueVehicleTypes}
          onClose={() => setEditDialogOpen(false)}
          onSave={async (newVehicleType: string) => {
            try {
              const updatedEvent: BaseEvent = {
                ...selectedEvent,
                vehicleType: newVehicleType,
              };
              await updateEvent(updatedEvent);
              setEditDialogOpen(false);
            } catch (err) {
              console.error("Error updating event:", err);
            }
          }}
        />
      )}
    </>
  );
}
