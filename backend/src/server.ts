import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


const trafficData = [
    { id: 1, type: "ferry", count: 200, timestamp: Date.now() },
    { id: 2, type: "tire", worn_out: 5, timestamp: Date.now() },
    { id: 3, type: "passage", vehicles: 150, timestamp: Date.now() }
];

app.get("/api/data", (req, res) => {
    res.json(trafficData);
});


const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    setInterval(() => {
        trafficData.forEach((entry) => (entry.timestamp = Date.now()));
        ws.send(JSON.stringify(trafficData));
    }, 5000);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
