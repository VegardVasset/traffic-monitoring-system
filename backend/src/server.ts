import app from "./app";
import { generateMockData } from "./data/generateData";
import { MockRecord } from "./types";
import { Server } from "socket.io";
import http from "http";

// Create an HTTP server and attach WebSocket to it
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Allow all origins for development
});

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

// Function to get the next ID based on existing data
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

// Add new mock data at regular intervals and notify clients
function continuouslyAddMockData() {
  console.log("Starting continuous mock data generation...");
  setInterval(() => {
    const now = new Date().toISOString();

    // Generate new data for each event type
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

    // Add new data to the database
    mockDatabase.ferry.push(newFerryData);
    mockDatabase.tire.push(newTireData);
    mockDatabase.vehicle.push(newVehicleData);

    // Notify all connected clients with the new data
    io.emit("newData", {
      ferry: newFerryData,
      tire: newTireData,
      vehicle: newVehicleData,
    });

    console.log("New mock data added and sent to clients:", {
      ferry: newFerryData,
      tire: newTireData,
      vehicle: newVehicleData,
    });
  }, 10000); // Generate new data every 10 seconds
}

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send initial data to the client
  socket.emit("initialData", {
    ferry: mockDatabase.ferry,
    tire: mockDatabase.tire,
    vehicle: mockDatabase.vehicle,
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  initializeMockDatabase();
  continuouslyAddMockData();
  console.log(`Server running on http://localhost:${PORT}`);
});

export { mockDatabase };
