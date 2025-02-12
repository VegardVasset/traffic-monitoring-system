import "@testing-library/jest-dom";

jest.mock("lucide-react", () => ({
    ArrowUp: () => "ArrowUpIcon",
    ArrowDown: () => "ArrowDownIcon",
    ArrowUpDown: () => "ArrowUpDownIcon",
  }));
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]), 
    })
  );
  