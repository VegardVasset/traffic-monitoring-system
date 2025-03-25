import express from "express";
import cors from "cors";
import vpcRoutes from "./routes/vpcRoutes";
import tiresRoutes from "./routes/tiresRoutes";
import dtsRoutes from "./routes/dtsRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/vpc", vpcRoutes);
app.use("/api/tires", tiresRoutes);
app.use("/api/dts", dtsRoutes);

export default app;
