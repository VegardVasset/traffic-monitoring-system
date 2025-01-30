import { Router } from "express";
import { mockDatabase } from "../server";

const router = Router();

router.get("/", (req, res) => {
  res.json(mockDatabase.tire);
});

export default router;
