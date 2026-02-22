import express from "express";
import {
  baselineSchedule,
  optimizedSchedule,
} from "../controllers/schedulerController.js";

const router = express.Router();

// 🔹 Baseline Scheduling
// POST /api/schedule/baseline
router.post("/baseline", baselineSchedule);

// 🔹 Optimized Scheduling
// POST /api/schedule/optimize
router.post("/optimize", optimizedSchedule);

export default router;
