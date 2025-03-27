import { render, screen } from "@testing-library/react";
import Header from "@/components/shared/layout/Header";
import "@testing-library/jest-dom";

// Make sure you import from the same path you mock
jest.mock("next/navigation", () => {
  const originalModule = jest.requireActual("next/navigation");
  return {
    ...originalModule,
    usePathname: jest.fn().mockReturnValue("/"),
  };
});

describe("Header Component", () => {
  it("renders navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Vehicle Passenger Counter")).toBeInTheDocument();
    expect(screen.getByText("Detailed Traffic Statistics")).toBeInTheDocument();
    expect(screen.getByText("Tire Scanner")).toBeInTheDocument();
  });
});
