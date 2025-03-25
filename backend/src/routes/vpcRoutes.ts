import { Router, Request, Response, NextFunction } from "express";
import { mockDatabase } from "../data/mockDatabase";
import { MockRecord } from "../types";

const router = Router();

// GET endpoint to retrieve all VPC records
router.get("/", (req: Request, res: Response) => {
  res.json(mockDatabase.vpc);
});

// PATCH endpoint to update a VPC record by its ID
router.patch<{ id: string }, any, Partial<MockRecord>>(
  "/:id",
  (req: Request<{ id: string }, any, Partial<MockRecord>>, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    const updateData = req.body;

    const index = mockDatabase.vpc.findIndex(record => record.id === id);
    if (index === -1) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    mockDatabase.vpc[index] = { ...mockDatabase.vpc[index], ...updateData };

    res.json(mockDatabase.vpc[index]);
  }
);

export default router;