import express from "express";
import cors from "cors"; 
import ferryRoutes from "./routes/ferryRoutes";
import tiresRoutes from "./routes/tiresRoutes";
import dtsRoutes from "./routes/dtsRoutes";

const app = express();

app.use(cors()); 
app.use("/api/ferry", ferryRoutes);
app.use("/api/tires", tiresRoutes);
app.use("/api/dts", dtsRoutes);

export default app;

