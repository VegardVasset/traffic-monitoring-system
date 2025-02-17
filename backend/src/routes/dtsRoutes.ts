// dtsRoutes.ts
import { Router, Request, Response } from "express";
import { mockDatabase } from "../server";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(mockDatabase.dts);
});

export default router;
