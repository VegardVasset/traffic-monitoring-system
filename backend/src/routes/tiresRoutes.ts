// tiresRoutes.ts
import { Router, Request, Response, NextFunction} from "express";
import { mockDatabase } from "../server";
import { MockRecord } from "../types";

const router = Router();

// GET endpoint to retrieve all tires records
router.get("/", (req: Request, res: Response) => {
  res.json(mockDatabase.tires);
});

// PATCH endpoint to update a tire record by its ID
router.patch<{ id: string }, any, Partial<MockRecord>>(
  "/:id",
  (req: Request<{ id: string }, any, Partial<MockRecord>>, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    const updateData = req.body;

    const index = mockDatabase.tires.findIndex(record => record.id === id);
    if (index === -1) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    // Update the record in memory
    mockDatabase.tires[index] = { ...mockDatabase.tires[index], ...updateData };
    console.log(`Updated Tires record ${id}:`, mockDatabase.tires[index]);

    // Call res.json without returning its value
    res.json(mockDatabase.tires[index]);
  }
);

export default router;