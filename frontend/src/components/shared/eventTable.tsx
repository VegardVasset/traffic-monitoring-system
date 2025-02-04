// components/EventTable.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/hooks/useSocket";

export interface Event {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  confidenceScore: number;
  camera: string; // make sure your events include the camera property
}

interface EventTableProps {
  domain: string;
  selectedCamera: string;
}

const columns: ColumnDef<Event>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-2">
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-2">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { disableSortBy: true },
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "creationTime",
    header: "Creation Time",
    cell: (info) =>
      new Date(info.getValue() as string).toLocaleString(),
  },
  {
    accessorKey: "receptionTime",
    header: "Reception Time",
    cell: (info) =>
      new Date(info.getValue() as string).toLocaleString(),
  },
  {
    accessorKey: "vehicleType",
    header: "Vehicle Type",
  },
  {
    accessorKey: "confidenceScore",
    header: "Confidence",
    cell: (info) =>
      `${((info.getValue() as number) * 100).toFixed(2)}%`,
  },
  // Optionally add a camera column if you want it visible:
  // {
  //   accessorKey: "camera",
  //   header: "Camera",
  // },
];

export default function EventTable({ domain, selectedCamera }: EventTableProps) {
  const { liveData, error: socketError } = useSocket(domain);
  const [apiData, setApiData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Fetch API data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/${domain}`);
        if (!res.ok)
          throw new Error(`Failed to fetch data: ${res.statusText}`);
        const jsonData = await res.json();
        setApiData(jsonData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [domain]);

  // Combine live and API data (ensuring unique IDs)
  const combinedData = useMemo(() => {
    const uniqueData = new Map<number, Event>();
    [...liveData, ...apiData].forEach((event) =>
      uniqueData.set(event.id, event)
    );
    return Array.from(uniqueData.values());
  }, [liveData, apiData]);

  // Filter the combined data based on the selected camera.
  const filteredData = useMemo(() => {
    if (selectedCamera === "all") return combinedData;
    return combinedData.filter((event) => event.camera === selectedCamera);
  }, [combinedData, selectedCamera]);

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
    state: {
      columnFilters,
      columnVisibility,
      pagination,
    },
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    manualPagination: false,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
  });

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (socketError)
    return <p className="text-red-500">WebSocket Error: {socketError}</p>;

  return (
    <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
      <h2 className="text-xl font-semibold mb-2">📋 {domain} Events</h2>
      {/* The event table no longer includes the camera selector */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by event type..."
          value={
            (table.getColumn("vehicleType")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("vehicleType")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-100">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="p-2 cursor-pointer"
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getCanSort() && (
                    <ArrowUpDown className="ml-2 inline-block" />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-200">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="p-2">
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
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {filteredData.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
