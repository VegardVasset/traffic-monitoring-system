import app from "./app";
import { generateMockData } from "./data/generateData";
import { MockRecord } from "./types";

// In-memory mock database
const mockDatabase: {
  ferry: MockRecord[];
  tire: MockRecord[];
  vehicle: MockRecord[];
} = {
  ferry: [],
  tire: [],
  vehicle: [],
};

// Generate initial 1000 records for each use case
function initializeMockDatabase() {
  console.log("Generating initial mock data...");
  mockDatabase.ferry = generateMockData("ferry_counting", 1000);
  mockDatabase.tire = generateMockData("tire_inspection", 1000);
  mockDatabase.vehicle = generateMockData("vehicle_passing", 1000);
  console.log("Initial mock data generated successfully!");
}

// Function to get the next ID based on the length of the existing data
function getNextId(eventType: string): number {
  switch (eventType) {
    case "ferry_counting":
      return mockDatabase.ferry.length + 1;
    case "tire_inspection":
      return mockDatabase.tire.length + 1;
    case "vehicle_passing":
      return mockDatabase.vehicle.length + 1;
    default:
      return 1;
  }
}

// Add new mock data at regular intervals for each use case
function continuouslyAddMockData() {
  console.log("Starting continuous mock data generation...");
  setInterval(() => {
    // Get the current time
    const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Oslo" }).replace(" ", "T") + "Z";


    // Generate one new record for each event type with correct sequential IDs
    const newFerryData = {
      ...generateMockData("ferry_counting", 1, {
        creationTime: now,
        receptionTime: now,
      })[0],
      id: getNextId("ferry_counting"),
    };

    const newTireData = {
      ...generateMockData("tire_inspection", 1, {
        creationTime: now,
        receptionTime: now,
      })[0],
      id: getNextId("tire_inspection"),
    };

    const newVehicleData = {
      ...generateMockData("vehicle_passing", 1, {
        creationTime: now,
        receptionTime: now,
      })[0],
      id: getNextId("vehicle_passing"),
    };

    mockDatabase.ferry.push(newFerryData);
    mockDatabase.tire.push(newTireData);
    mockDatabase.vehicle.push(newVehicleData);

    console.log("New mock data added:", {
      ferry: newFerryData,
      tire: newTireData,
      vehicle: newVehicleData,
    });
  }, 10000); 
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  initializeMockDatabase();
  continuouslyAddMockData();
  console.log(`Server running on http://localhost:${PORT}`);
});

export { mockDatabase };
