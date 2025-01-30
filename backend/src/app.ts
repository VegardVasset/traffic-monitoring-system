import express from "express";
import ferryRoutes from "./routes/ferryRoutes";
import tiresRoutes from "./routes/tiresRoutes";
import vehiclesRoutes from "./routes/vehiclesRoutes";

const app = express();

app.use("/api/ferries", ferryRoutes);
app.use("/api/tires", tiresRoutes);
app.use("/api/vehicles", vehiclesRoutes);

export default app;
