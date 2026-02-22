import express from "express";
import { runScheduler } from "../controllers/icuController.js";
import { optimizedSchedule } from "../controllers/schedulerController.js";
const router = express.Router();

router.post("/run-baseline", runScheduler);
router.post("/optimize", optimizedSchedule);

export default router;
