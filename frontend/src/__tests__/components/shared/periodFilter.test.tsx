import { render, screen, fireEvent } from "@testing-library/react";
import PeriodFilter from "@/components/shared/PeriodFilter";

describe("PeriodFilter", () => {
  it("updates date range", () => {
    const onChange = jest.fn();
    render(<PeriodFilter startDate="2024-01-01" endDate="2024-01-31" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Start Date:"), {
      target: { value: "2024-02-01" },
    });
    expect(onChange).toHaveBeenCalledWith("2024-02-01", "2024-01-31");
  });
});