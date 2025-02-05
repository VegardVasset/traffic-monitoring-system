import express, { Request, Response } from "express";
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

// ✅ In-memory mock database
const mockDatabase: Record<string, MockRecord[]> = {
  ferry: [],
  tires: [],
  dts: [],
};

// ✅ Generate initial 1000 records for each entity type
function initializeMockDatabase() {
  console.log("Generating initial mock data...");
  mockDatabase.ferry = generateMockData("ferry", 10000);
  mockDatabase.tires = generateMockData("tires", 10000);
  mockDatabase.dts = generateMockData("dts", 10000);
  console.log("Initial mock data generated successfully!");
}

// ✅ Function to get the next ID safely
function getNextId(entityType: keyof typeof mockDatabase): number {
  return (mockDatabase[entityType]?.length ?? 0) + 1;
}

// ✅ Add new mock data at regular intervals and notify clients
function continuouslyAddMockData() {
  console.log("Starting continuous mock data generation...");
  setInterval(() => {
    const creationTime = new Date().toISOString();
    const receptionTime = getReceptionTime(creationTime);

    const newData = {
      ferry: {
        ...generateMockData("ferry", 1, { creationTime, receptionTime })[0],
        id: getNextId("ferry"),
      },
      tires: {
        ...generateMockData("tires", 1, { creationTime, receptionTime })[0],
        id: getNextId("tires"),
      },
      dts: {
        ...generateMockData("dts", 1, { creationTime, receptionTime })[0],
        id: getNextId("dts"),
      },
    };

    // ✅ Fix: Broadcast only to relevant WebSocket rooms
    (Object.keys(newData) as Array<keyof typeof newData>).forEach((entity) => {
      io.to(entity).emit("newData", newData[entity]); // Only send data for that entity
    });

    // ✅ Update database
    mockDatabase.ferry.push(newData.ferry);
    mockDatabase.tires.push(newData.tires);
    mockDatabase.dts.push(newData.dts);
  }, 10000); // New data every 10s
}

// ✅ API routes for fetching initial data
const router = express.Router();

router.get("/ferry", (req: Request, res: Response) => {
  res.json(mockDatabase.ferry);
});

router.get("/tires", (req: Request, res: Response) => {
  res.json(mockDatabase.tires);
});

router.get("/dts", (req: Request, res: Response) => {
  res.json(mockDatabase.dts);
});

// Attach routes to Express app
app.use("/api", router);

// ✅ WebSocket handling (Only send relevant data)
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("requestData", (entityType: keyof typeof mockDatabase) => {
    console.log(`Client requested data for: ${entityType}`);

    if (mockDatabase[entityType]) {
      socket.join(entityType); // Join specific room for this entity
      socket.emit("initialData", mockDatabase[entityType]);
    } else {
      socket.emit("error", { message: "Invalid entity type requested" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  initializeMockDatabase();
  continuouslyAddMockData();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { mockDatabase };
