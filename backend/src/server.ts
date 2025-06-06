import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { generateMockData, getReceptionTime } from "./data/generateData";
import { mockDatabase } from "./data/mockDatabase";

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// Generate initial 10,000 records for each entity type
function initializeMockDatabase() {
  console.log("Generating initial mock data...");
  mockDatabase.vpc = generateMockData("vpc", 10000);
  mockDatabase.tires = generateMockData("tires", 10000);
  mockDatabase.dts = generateMockData("dts", 10000);
  console.log("Initial mock data generated successfully!");
}

function getNextId(entityType: keyof typeof mockDatabase): number {
  return (mockDatabase[entityType]?.length ?? 0) + 1;
}

// Continuously add new mock data every 10 seconds
function continuouslyAddMockData() {
  console.log("Starting continuous mock data generation...");
  setInterval(() => {
    const creationTime = new Date().toISOString();
    const receptionTime = getReceptionTime(creationTime);

    const newData = {
      vpc: {
        ...generateMockData("vpc", 1, { creationTime, receptionTime })[0],
        id: getNextId("vpc"),
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

    (Object.keys(newData) as Array<keyof typeof newData>).forEach((entity) => {
      io.to(entity).emit("newData", newData[entity]);
    });

    mockDatabase.vpc.push(newData.vpc);
    mockDatabase.tires.push(newData.tires);
    mockDatabase.dts.push(newData.dts);
  }, 10000);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("requestData", (entityType: keyof typeof mockDatabase) => {
    console.log(`Client requested data for: ${entityType}`);
    if (mockDatabase[entityType]) {
      socket.join(entityType);
      socket.emit("initialData", mockDatabase[entityType]);
    } else {
      socket.emit("error", { message: "Invalid entity type requested" });
    }
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
