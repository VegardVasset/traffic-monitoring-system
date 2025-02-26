"use client";

import React, { useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

// ShadCN UI components (imported separately):
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface Camera {
  id: string
  name: string
}

interface FilterPanelProps {
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

export default function FilterPanel({
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
}: FilterPanelProps) {
  const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false)
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
    ? "All Types"
    : selectedCount === 0
    ? "All Types"
    : `${selectedCount} Selected`

  // Toggle a single vehicle type in or out of the selected array
  function toggleVehicleType(type: string) {
    if (selectedVehicleTypes.includes(type)) {
      setSelectedVehicleTypes(selectedVehicleTypes.filter((t) => t !== type))
    } else {
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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use a wrapping container with smaller text, 
            then place each filter in its own "block" */}
        <div className="flex flex-wrap gap-4 text-sm">

          {/* CAMERA SELECT */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <Label htmlFor="camera-select" className="whitespace-nowrap">
              Camera
            </Label>
            <Select
              value={selectedCamera}
              onValueChange={(val) => setSelectedCamera(val)}
            >
              <SelectTrigger
                id="camera-select"
                // Let it grow to full width on very small screens, 
                // but smaller on sm+ screens
                className="w-full sm:w-[150px] h-8 text-sm mt-1 sm:mt-0"
              >
                <SelectValue placeholder="All Cameras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cameras</SelectItem>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VEHICLE TYPE MULTI-SELECT (Popover + Command) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <Label htmlFor="vehicle-type" className="whitespace-nowrap">
              Vehicle Type
            </Label>
            <Popover
              open={vehiclePopoverOpen}
              onOpenChange={setVehiclePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[150px] h-8 text-sm mt-1 sm:mt-0 justify-between"
                >
                  {buttonText}
                  <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search..."
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
                              // Keep popover open
                              setVehiclePopoverOpen(true)
                            }}
                          >
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

          {/* BIN SIZE SELECT */}
          {showBinSize && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Label htmlFor="bin-size-select" className="whitespace-nowrap">
                Bin Size
              </Label>
              <Select
                value={binSize}
                onValueChange={(val) =>
                  setBinSize(val as "hour" | "day" | "week")
                }
              >
                <SelectTrigger
                  id="bin-size-select"
                  className="w-full sm:w-[100px] h-8 text-sm mt-1 sm:mt-0"
                >
                  <SelectValue placeholder="Hourly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Hourly</SelectItem>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* LIVE SWITCH */}
          {showLiveButton && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Label htmlFor="live-switch" className="whitespace-nowrap">
                Live Mode
              </Label>
              <Switch
                checked={isLive}
                onCheckedChange={(checked) => setIsLive(checked)}
                id="live-switch"
                className="mt-1 sm:mt-0"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
