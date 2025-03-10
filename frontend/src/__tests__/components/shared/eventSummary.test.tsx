import { render, screen } from "@testing-library/react";
import EventSummary from "@/components/shared/eventCount";

describe("EventSummary", () => {
  it("displays event count and date range", () => {
    render(<EventSummary count={10} startDate="2024-01-01" endDate="2024-01-31" />);
    expect(screen.getByText("Total events from 2024-01-01 to 2024-01-31: 10")).toBeInTheDocument();
  });
});