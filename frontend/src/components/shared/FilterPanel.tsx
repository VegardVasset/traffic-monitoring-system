"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface Camera {
  id: string;
  name: string;
}

export interface FilterPanelProps {
  cameras: Camera[];
  selectedCamera: string;
  setSelectedCamera: (value: string) => void;
  vehicleTypes: string[];
  selectedVehicleTypes: string[];
  setSelectedVehicleTypes: (value: string[]) => void;
  binSize: "hour" | "day" | "week" | "month";
  setBinSize: (value: "hour" | "day" | "week" | "month") => void;
  isLive: boolean;
  setIsLive: (value: boolean) => void;
  showBinSize?: boolean;
  showLiveButton?: boolean;
  useCardWrapper?: boolean;
  onRefetch?: () => void;
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
  showBinSize,
  showLiveButton = true,
  useCardWrapper = false,
}: FilterPanelProps) {
  const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredVehicleTypes = useMemo(() => {
    if (!search) return vehicleTypes;
    return vehicleTypes.filter((type) =>
      type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, vehicleTypes]);

  const selectedCount = selectedVehicleTypes.length;
  const allSelected = selectedCount === vehicleTypes.length;
  const buttonText =
    allSelected || selectedCount === 0 ? "All Types" : `${selectedCount} Selected`;

    const toggleVehicleType = useCallback(
      (type: string) => {
        if (selectedVehicleTypes.includes(type)) {
          setSelectedVehicleTypes(selectedVehicleTypes.filter((t) => t !== type));
        } else {
          setSelectedVehicleTypes([...selectedVehicleTypes, type]);
        }
      },
      [selectedVehicleTypes, setSelectedVehicleTypes]
    );
    

  const handleSelectAll = useCallback(() => {
    setSelectedVehicleTypes(vehicleTypes);
  }, [setSelectedVehicleTypes, vehicleTypes]);

  const handleClearAll = useCallback(() => {
    setSelectedVehicleTypes([]);
  }, [setSelectedVehicleTypes]);

  const renderCameraSelect = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
      <Label htmlFor="camera-select" className="whitespace-nowrap text-xs">
        Camera
      </Label>
      <Select value={selectedCamera} onValueChange={setSelectedCamera}>
        <SelectTrigger
          id="camera-select"
          className="w-full sm:w-[120px] h-6 text-xs mt-1 sm:mt-0"
        >
          <SelectValue placeholder="All Cameras" />
        </SelectTrigger>
        <SelectContent className="text-xs">
          <SelectItem value="all">All Cameras</SelectItem>
          {cameras.map((camera) => (
            <SelectItem key={camera.id} value={camera.id}>
              {camera.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderVehicleTypeFilter = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
      <Label htmlFor="vehicle-type" className="whitespace-nowrap text-xs">
        Vehicle Type
      </Label>
      <Popover open={vehiclePopoverOpen} onOpenChange={setVehiclePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-[120px] h-6 text-xs mt-1 sm:mt-0 justify-between"
          >
            {buttonText}
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0 text-xs">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No vehicle types found.</CommandEmpty>
              <CommandGroup>
                {filteredVehicleTypes.map((type) => {
                  const selected = selectedVehicleTypes.includes(type);
                  return (
                    <CommandItem
                      key={type}
                      onSelect={() => {
                        toggleVehicleType(type);
                        setVehiclePopoverOpen(true);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {type}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll}>Select All</CommandItem>
                <CommandItem onSelect={handleClearAll}>Clear All</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderTimeIntervalSelect = () =>
    showBinSize && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
        <Label htmlFor="bin-size-select" className="whitespace-nowrap text-xs">
          Time Interval
        </Label>
        <Select
          value={binSize}
          onValueChange={(val) =>
            setBinSize(val as "hour" | "day" | "week" | "month")
          }
        >
          <SelectTrigger
            id="bin-size-select"
            className="w-full sm:w-[80px] h-6 text-xs mt-1 sm:mt-0"
          >
            <SelectValue placeholder="Daily" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="hour">Hourly</SelectItem>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );

  const renderLiveSwitch = () =>
    showLiveButton && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
        <Label htmlFor="live-switch" className="whitespace-nowrap text-xs">
          Live Mode
        </Label>
        <Switch
          id="live-switch"
          checked={isLive}
          onCheckedChange={setIsLive}
          className="mt-1 sm:mt-0 scale-90"
        />
      </div>
    );

  const content = (
    <div className="text-xs">
      <div className="mb-1 font-bold">Filters</div>
      <div className="flex flex-wrap gap-1">
        {renderCameraSelect()}
        {renderVehicleTypeFilter()}
        {renderTimeIntervalSelect()}
        {renderLiveSwitch()}
      </div>
    </div>
  );

  return useCardWrapper ? <Card className="p-2 mb-4">{content}</Card> : content;
}
