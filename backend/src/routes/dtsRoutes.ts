import { Router, Request, Response, NextFunction } from "express";
import { mockDatabase } from "../server";
import { MockRecord } from "../types";

const router = Router();

// GET endpoint to retrieve all DTS records
router.get("/", (req: Request, res: Response) => {
  res.json(mockDatabase.dts);
});

// PATCH endpoint to update a DTS record by its ID
router.patch<{ id: string }, any, Partial<MockRecord>>(
  "/:id",
  (req: Request<{ id: string }, any, Partial<MockRecord>>, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    const updateData = req.body;

    const index = mockDatabase.dts.findIndex(record => record.id === id);
    if (index === -1) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    // Update the record in memory
    mockDatabase.dts[index] = { ...mockDatabase.dts[index], ...updateData };

    res.json(mockDatabase.dts[index]);
  }
);

export default router;