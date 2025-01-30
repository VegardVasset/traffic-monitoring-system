import express from "express";
import cors from "cors";
import eventsRoutes from "./routes/eventsRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", eventsRoutes); // Mount the route at /api

export default app;
