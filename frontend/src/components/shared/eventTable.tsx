"use client";

import { useMemo, useState } from "react";
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useData } from "@/context/DataContext";

export interface Event {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  confidenceScore: number;
  camera: string;
  tireType?: "Sommerdekk" | "Vinterdekk";
  tireCondition?: number;
  passengerCount?: number;
}

interface EventTableProps {
  domain: string;
  selectedCamera: string;
  selectedVehicleTypes: string[];
}

const getColumns = (domain: string): ColumnDef<Event>[] => {
  const baseColumns: ColumnDef<Event>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div>
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div>
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      cell: (info) => `${((info.getValue() as number) * 100).toFixed(2)}%`,
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

  if (domain === "ferry") {
    baseColumns.push({
      accessorKey: "passengerCount",
      header: "Passenger Count",
      cell: (info) => info.getValue() || "N/A",
    });
  }

  return baseColumns;
};

export default function EventTable({
  domain,
  selectedCamera,
  selectedVehicleTypes,
}: EventTableProps) {
  const { data, loading, error } = useData();

  // Filter data based on selectedCamera and selectedVehicleTypes
  const filteredData = useMemo(() => {
    let dataArr = data as Event[];
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: filteredData,
    columns: getColumns(domain),
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
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
  });

  if (loading) return <p className="text-gray-500">Loading events...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    // Make sure the parent div is full width, and let it scroll horizontally if needed
    <div className="w-full bg-white shadow rounded-lg">
      <div className="flex items-center py-1 sm:py:4 px-1 sm:px-4">
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
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Overflow container for the actual table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full table-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                  const sorting = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="cursor-pointer text-xs sm:text-sm md:text-base p-1 sm:p-2 whitespace-nowrap"
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {header.column.getCanSort() &&
                          (sorting === "asc" ? (
                            <ArrowUp className="ml-2 inline-block w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          ) : sorting === "desc" ? (
                            <ArrowDown className="ml-2 inline-block w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          ) : (
                            <ArrowUpDown className="ml-2 inline-block w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          ))}
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
                className="hover:bg-gray-200 text-xs sm:text-sm md:text-base"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-1 sm:p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2 sm:items-center p-2 sm:p-4 text-xs sm:text-sm">
        <div className="text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {filteredData.length} row(s) selected.
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
  );
}
