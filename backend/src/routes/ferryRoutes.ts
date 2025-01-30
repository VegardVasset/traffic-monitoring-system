import { Router } from "express";
import { generateMockData } from "../data/generateData";

const router = Router();

router.get("/dynamic", (req, res) => {
  const count = Number(req.query.count) || 10;
  const data = generateMockData("ferry_counting", count);
  res.json(data);
});

export default router;
