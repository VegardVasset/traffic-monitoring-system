import express from "express";
import cors from "cors"; 
import ferryRoutes from "./routes/ferryRoutes";
import tiresRoutes from "./routes/tiresRoutes";
import vehiclesRoutes from "./routes/vehiclesRoutes";

const app = express();

app.use(cors()); 
app.use("/api/ferry", ferryRoutes);
app.use("/api/tires", tiresRoutes);
app.use("/api/vehicles", vehiclesRoutes);

export default app;

