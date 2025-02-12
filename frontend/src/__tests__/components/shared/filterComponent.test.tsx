import { render, screen, fireEvent } from "@testing-library/react";
import FilterComponent from "@/components/shared/filterComponent";

describe("FilterComponent", () => {
  it("renders and updates filters", () => {
    const setSelectedCamera = jest.fn();
    const setSelectedVehicleType = jest.fn();
    const setIsLive = jest.fn();

    render(
      <FilterComponent
        cameras={[{ id: "1", name: "Camera 1" }]}
        selectedCamera="all"
        setSelectedCamera={setSelectedCamera}
        vehicleTypes={["car", "bus"]}
        selectedVehicleType="all"
        setSelectedVehicleType={setSelectedVehicleType}
        isLive={false}
        setIsLive={setIsLive}
      />
    );

    fireEvent.change(screen.getByLabelText("Camera:"), {
      target: { value: "1" },
    });
    expect(setSelectedCamera).toHaveBeenCalledWith("1");
  });
});