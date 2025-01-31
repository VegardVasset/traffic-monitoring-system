import express from "express";
import app from "./app";
import { generateMockData, getReceptionTime } from "./data/generateData";
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

// Generate initial 1000 records for each entity type
function initializeMockDatabase() {
  console.log("Generating initial mock data...");
  mockDatabase.ferry = generateMockData("ferry", 1000);
  mockDatabase.tire = generateMockData("tire", 1000);
  mockDatabase.vehicle = generateMockData("vehicle", 1000);
  console.log("Initial mock data generated successfully!");
}

// Function to get the next ID based on existing data
function getNextId(entityType: string): number {
  switch (entityType) {
    case "ferry":
      return mockDatabase.ferry.length + 1;
    case "tire":
      return mockDatabase.tire.length + 1;
    case "vehicle":
      return mockDatabase.vehicle.length + 1;
    default:
      return 1;
  }
}

// Add new mock data at regular intervals and notify clients via WebSockets
function continuouslyAddMockData() {
  console.log("Starting continuous mock data generation...");
  setInterval(() => {
    const creationTime = new Date().toISOString();
    const receptionTime = getReceptionTime(creationTime);

    const newFerryData = {
      ...generateMockData("ferry", 1, { creationTime, receptionTime })[0],
      id: getNextId("ferry"),
    };

    const newTireData = {
      ...generateMockData("tire", 1, { creationTime, receptionTime })[0],
      id: getNextId("tire"),
    };

    const newVehicleData = {
      ...generateMockData("vehicle", 1, { creationTime, receptionTime })[0],
      id: getNextId("vehicle"),
    };

    // Add to the mock database
    mockDatabase.ferry.push(newFerryData);
    mockDatabase.tire.push(newTireData);
    mockDatabase.vehicle.push(newVehicleData);

    // Notify all connected clients with the new data
    io.emit("newData", {
      ferry: newFerryData,
      tire: newTireData,
      vehicle: newVehicleData,
    });
  }, 10000); // New data every 10s
}

// API routes to fetch initial data
const router = express.Router();

router.get("/ferries", (req, res) => {
  res.json(mockDatabase.ferry);
});

router.get("/tires", (req, res) => {
  res.json(mockDatabase.tire);
});

router.get("/vehicles", (req, res) => {
  res.json(mockDatabase.vehicle);
});

// Attach routes to the Express app
app.use("/api", router);

// WebSocket handling for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

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
