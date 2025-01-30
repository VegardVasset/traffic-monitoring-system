import { Router } from "express";
import { mockEvents } from "../data/mockData";

const router = Router();

router.get("/events", (req, res) => {
    res.json(mockEvents);
});

export default router;
