// EditDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BaseEvent } from "@/context/DataContext";

interface EditDialogProps {
  event: BaseEvent;
  uniqueVehicleTypes: string[];
  onClose: () => void;
  onSave: (newVehicleType: string) => Promise<void>;
}

export default function EditDialog({
  event,
  uniqueVehicleTypes,
  onClose,
  onSave,
}: EditDialogProps) {
  const [editVehicleType, setEditVehicleType] = useState<string>(
    event.vehicleType
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Correct Vehicle Type
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <Label className="text-sm">Vehicle Type:</Label>
          <Select
            value={editVehicleType}
            onValueChange={(val: string) => setEditVehicleType(val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose type" />
            </SelectTrigger>
            <SelectContent>
              {uniqueVehicleTypes.map((vt) => (
                <SelectItem key={vt} value={vt}>
                  {vt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editVehicleType)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}