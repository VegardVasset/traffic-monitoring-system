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
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react";
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
  camera: string;
  tireType?: "Sommerdekk" | "Vinterdekk"; 
  tireCondition?: number;
  passengerCount?: number; 
}

interface EventTableProps {
  domain: string;
  selectedCamera: string;
  selectedVehicleType: string;
  isLive: boolean;
}

// Dynamically generate columns based on the domain
const getColumns = (domain: string): ColumnDef<Event>[] => {
  const baseColumns: ColumnDef<Event>[] = [
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
      cell: (info) =>
        `${((info.getValue() as number) * 100).toFixed(2)}%`,
    },
  ];

  //  Add `tireType` column only for "tires" domain
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
  

  // Add `passengerCount` column only for "ferry" domain
  if (domain === "ferry") {
    baseColumns.push({
      accessorKey: "passengerCount",
      header: "Passenger Count",
      cell: (info) => info.getValue() || "N/A", // Show "N/A" if missing
    });
  }

  return baseColumns;
};

const RAILWAY_URL = "https://traffic-monitoring-system-production.up.railway.app";

export default function EventTable({
  domain,
  selectedCamera,
  selectedVehicleType,
  isLive,
}: EventTableProps) {
  const { liveData, error: socketError } = useSocket(domain, isLive);
  const [apiData, setApiData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [frozenLiveData, setFrozenLiveData] = useState<Event[]>([]);
  const [backlogFetched, setBacklogFetched] = useState(false);

  // Fetch initial API data on mount.
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${RAILWAY_URL}/api/${domain}`);
        if (!res.ok)
          throw new Error(`Failed to fetch data: ${res.statusText}`);
        const jsonData = await res.json();
        setApiData(jsonData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [domain]);

  // Freeze live data when live mode is turned off
  useEffect(() => {
    if (!isLive) {
      setFrozenLiveData(liveData);
      setBacklogFetched(false);
    }
  }, [isLive, liveData]);

  // Fetch backlog events when live mode is turned on
  useEffect(() => {
    if (isLive && !backlogFetched) {
      const allEvents = [...apiData, ...frozenLiveData];
      let lastTimestamp = 0;
      if (allEvents.length > 0) {
        lastTimestamp = Math.max(
          ...allEvents.map((event) => new Date(event.creationTime).getTime())
        );
      }
      fetch(`${RAILWAY_URL}/api/${domain}?after=${lastTimestamp}`)
        .then((res) => res.json())
        .then((backlog: Event[]) => {
          if (backlog && backlog.length > 0) {
            setApiData((prev) => [...prev, ...backlog]);
          }
          setBacklogFetched(true);
        })
        .catch((err) => {
          console.error("Error fetching backlog events:", err);
          setBacklogFetched(true);
        });
    }
  }, [isLive, backlogFetched, domain]);

  // Combine API data with live or frozen socket data
  const combinedData = useMemo(() => {
    const uniqueData = new Map<number, Event>();
    const liveUsed = isLive ? liveData : frozenLiveData;
    [...apiData, ...liveUsed].forEach((event) =>
      uniqueData.set(event.id, event)
    );
    return Array.from(uniqueData.values()).sort(
      (a, b) =>
        new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime()
    );
  }, [apiData, liveData, frozenLiveData, isLive]);

  // Filter data by the selected camera and vehicle type
  const filteredData = useMemo(() => {
    let data = combinedData;
    if (selectedCamera !== "all") {
      data = data.filter((record) => record.camera === selectedCamera);
    }
    if (selectedVehicleType !== "all") {
      data = data.filter(
        (record) => record.vehicleType === selectedVehicleType
      );
    }
    return data;
  }, [combinedData, selectedCamera, selectedVehicleType]);

  const table = useReactTable({
    data: filteredData,
    columns: getColumns(domain), // ✅ Dynamically generate columns
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

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (socketError)
    return <p className="text-red-500">WebSocket Error: {socketError}</p>;

  return (
    <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
      <h2 className="text-xl font-semibold mb-2">Passings</h2>
      <div className="flex items-center py-4">
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
              {headerGroup.headers.map((header) => {
                const sorting = header.column.getIsSorted();
                return (
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
                    {header.column.getCanSort() &&
                      (sorting === "asc" ? (
                        <ArrowUp className="ml-2 inline-block" />
                      ) : sorting === "desc" ? (
                        <ArrowDown className="ml-2 inline-block" />
                      ) : (
                        <ArrowUpDown className="ml-2 inline-block" />
                      ))}
                  </TableHead>
                );
              })}
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
