"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
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
import { useAnalytics } from "@/context/AnalyticsContext";
import EditDialog from "./EditDialog";

// --- Custom hooks ---
import { useFilteredData } from "./hooks/useFilteredData";
import { useLiveLatencyLogger } from "./hooks/useLiveLatencyLogger";
import { usePassingsColumns } from "./hooks/usePassingsColumns";

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
  /**
   * -------------------------------------------------------------------------
   * Top-level hooks: must always be called in the same order, unconditionally.
   * -------------------------------------------------------------------------
   */
  const { data, loading, error, lastUpdateArrivalTime, updateEvent } = useData();
  const { logEvent } = useAnalytics();

  // Filtered data via custom hook
  const filteredData = useFilteredData({
    data,
    selectedCamera,
    selectedVehicleTypes,
  });

  // Latency logger via custom hook
  useLiveLatencyLogger({
    lastUpdateArrivalTime,
    filteredDataLength: filteredData.length,
    logEvent,
  });

  // React Table states
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BaseEvent | null>(null);

  // Edit handler
  const handleEdit = useCallback((event: BaseEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  }, []);

  // Unique vehicle types for the EditDialog dropdown
  const uniqueVehicleTypes = useMemo(() => {
    const types = new Set(data.map((e) => e.vehicleType));
    return Array.from(types);
  }, [data]);

  // Columns (custom hook)
  // IMPORTANT: call it directly, do NOT wrap in useMemo again.
  const columns = usePassingsColumns({
    domain,
    onEdit: handleEdit,
  });

  // Create the TanStack table instance
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

  /**
   * -------------------------------------------------------------------------
   * Conditional rendering (loading/error) after hooks are defined
   * -------------------------------------------------------------------------
   */
  if (loading) {
    return (
      <p className="text-gray-500" aria-live="polite">
        Loading events...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-500" role="alert">
        Error: {error}
      </p>
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Render the table
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <div className="w-full bg-white shadow rounded-lg">
        {/* Table header with column visibility options */}
        <div className="flex items-center py-1 sm:py-4 px-1 sm:px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto text-xs px-2"
                aria-label="Toggle columns"
              >
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  aria-label={`Toggle ${column.id} column`}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <Table
            className="w-full table-auto border-collapse border border-gray-300"
            role="table"
          >
            <TableHeader role="rowgroup">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gray-100 border-b border-gray-300"
                  role="row"
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
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && header.column.getCanSort()) {
                            const toggleHandler =
                              header.column.getToggleSortingHandler();
                            if (toggleHandler) {
                              toggleHandler(e);
                            }
                          }
                        }}
                        aria-sort={
                          sorting === "asc"
                            ? "ascending"
                            : sorting === "desc"
                            ? "descending"
                            : "none"
                        }
                        role="columnheader"
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
            <TableBody role="rowgroup">
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-200 text-xs sm:text-sm md:text-base border-b border-gray-300"
                  role="row"
                  tabIndex={0}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-1 sm:p-2 border-r last:border-r-0 border-gray-300"
                      role="cell"
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
          <div className="text-muted-foreground" aria-live="polite">
            {filteredData.length} row(s).
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 px-2 sm:h-8 sm:px-3"
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 px-2 sm:h-8 sm:px-3"
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedEvent && (
        <EditDialog
          event={selectedEvent}
          uniqueVehicleTypes={uniqueVehicleTypes}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={async (newVehicleType: string) => {
            try {
              const updatedEvent: BaseEvent = {
                ...selectedEvent,
                vehicleType: newVehicleType,
              };
              await updateEvent(updatedEvent);
              setIsEditDialogOpen(false);
            } catch (err) {
              console.error("Error updating event:", err);
              alert(
                "An error occurred while updating the event. Please try again."
              );
            }
          }}
        />
      )}
    </>
  );
}
