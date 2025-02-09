// src/__tests__/components/layout/header.test.tsx
import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/header";
import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

describe("Header Component", () => {
  it("renders navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Ferry Counter")).toBeInTheDocument();
    expect(screen.getByText("Detailed Traffic Statistics")).toBeInTheDocument();
    expect(screen.getByText("Tire Scanner")).toBeInTheDocument();
  });
});
