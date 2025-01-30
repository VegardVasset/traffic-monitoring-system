import app from "./app";
import { generateMockData } from "./data/generateData";
import { MockRecord } from "./types";


const mockDatabase: {
  ferry: MockRecord[];
  tire: MockRecord[];
  vehicle: MockRecord[];
} = {
  ferry: [],
  tire: [],
  vehicle: [],
};

// Generate 1000 records for each event type
function initializeMockDatabase() {
  console.log("Generating mock data...");
  mockDatabase.ferry = generateMockData("ferry_counting", 1000);
  mockDatabase.tire = generateMockData("tire_inspection", 1000);
  mockDatabase.vehicle = generateMockData("vehicle_passing", 1000);
  console.log("Mock data generated successfully!");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  initializeMockDatabase();
  console.log(`Server running on http://localhost:${PORT}`);
});

export { mockDatabase };
