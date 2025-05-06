import { useMemo } from "react";
import { BaseEvent } from "@/context/DataContext";

interface UseFilteredDataProps {
  data: BaseEvent[];
  selectedCamera: string;
  selectedVehicleTypes: string[];
}

export function useFilteredData({ data, selectedCamera, selectedVehicleTypes }: UseFilteredDataProps): BaseEvent[] {
  return useMemo(() => {
    let dataArr = data;
    if (selectedCamera !== "all") {
      dataArr = dataArr.filter(record => record.camera === selectedCamera);
    }
    if (selectedVehicleTypes.length > 0) {
      dataArr = dataArr.filter(record => selectedVehicleTypes.includes(record.vehicleType));
    }
    return dataArr;
  }, [data, selectedCamera, selectedVehicleTypes]);
}