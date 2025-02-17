"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

// ShadCN UI components:
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"

// Optional ShadCN utility for class names:
import { cn } from "@/lib/utils"

export interface Camera {
  id: string
  name: string
}

export interface FilterComponentProps {
  cameras: Camera[]
  selectedCamera: string
  setSelectedCamera: (value: string) => void

  vehicleTypes: string[]
  selectedVehicleTypes: string[] 
  setSelectedVehicleTypes: (value: string[]) => void

  binSize: "hour" | "day" | "week"
  setBinSize: (value: "hour" | "day" | "week") => void

  isLive: boolean
  setIsLive: (value: boolean) => void

  showBinSize?: boolean
  showLiveButton?: boolean
}

export default function FilterComponent({
  cameras,
  selectedCamera,
  setSelectedCamera,
  vehicleTypes,
  selectedVehicleTypes,
  setSelectedVehicleTypes,
  binSize,
  setBinSize,
  isLive,
  setIsLive,
  showBinSize = true,
  showLiveButton = true,
}: FilterComponentProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Filter the list of vehicle types by user’s search text:
  const filteredVehicleTypes = useMemo(() => {
    if (!search) return vehicleTypes
    return vehicleTypes.filter((vt) =>
      vt.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, vehicleTypes])

  // Count how many are selected
  const selectedCount = selectedVehicleTypes.length
  const allSelected = selectedCount === vehicleTypes.length

  // This text appears on the multi-select button
  const buttonText = allSelected
    ? "All Vehicle Types"
    : selectedCount === 0
    ? "All Vehicle Types"
    : `${selectedCount} Vehicle Type(s) Selected`

  // Toggle a single vehicle type in or out of the selected array
  function toggleVehicleType(type: string) {
    if (selectedVehicleTypes.includes(type)) {
      // Remove it
      setSelectedVehicleTypes(selectedVehicleTypes.filter((t) => t !== type))
    } else {
      // Add it
      setSelectedVehicleTypes([...selectedVehicleTypes, type])
    }
  }

  function handleSelectAll() {
    setSelectedVehicleTypes(vehicleTypes)
  }

  function handleClearAll() {
    setSelectedVehicleTypes([])
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
      {/* -----------------------------
          CAMERA DROPDOWN
      ----------------------------- */}
      <div className="flex items-center">
        <label htmlFor="camera-select" className="mr-2 font-medium">
          Camera:
        </label>
        <select
          id="camera-select"
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Cameras</option>
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.name}
            </option>
          ))}
        </select>
      </div>

      {/* -----------------------------
          VEHICLE TYPE MULTI-SELECT
          (Popover + Command)
      ----------------------------- */}
      <div className="flex items-center">
      <label htmlFor="bin-size-select" className="mr-2 font-medium">
            Vehicle Type:
          </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] justify-between"
            >
              {buttonText}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput
                placeholder="Search vehicle types..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>No vehicle types found.</CommandEmpty>

                <CommandGroup>
                  {filteredVehicleTypes.map((vt) => {
                    const selected = selectedVehicleTypes.includes(vt)
                    return (
                      <CommandItem
                        key={vt}
                        onSelect={() => {
                          toggleVehicleType(vt)
                          // By default, this will close the popover.
                          // If you want to keep it open, see the note below.
                          setOpen(true)
                        }}
                      >
                        {/* Show a check icon if this vehicle type is selected */}
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {vt}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleSelectAll}>
                    Select All
                  </CommandItem>
                  <CommandItem onSelect={handleClearAll}>
                    Clear All
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* -----------------------------
          BIN SIZE DROPDOWN
      ----------------------------- */}
      {showBinSize && (
        <div className="flex items-center">
          <label htmlFor="bin-size-select" className="mr-2 font-medium">
            Bin Size:
          </label>
          <select
            id="bin-size-select"
            value={binSize}
            onChange={(e) =>
              setBinSize(e.target.value as "hour" | "day" | "week")
            }
            className="border rounded p-1"
          >
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
      )}

       {/* Live Button: Render only if showLiveButton is true */}
       {showLiveButton && (
        <div>
          <Button
            variant={isLive ? "destructive" : "outline"}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "Stop LIVE" : "LIVE"}
          </Button>
        </div>
      )}
    </div>
  )
}
