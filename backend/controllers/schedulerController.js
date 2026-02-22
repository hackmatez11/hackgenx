import { runBaselineScheduler } from "../services/icuScheduler.js";
import { runOptimizedScheduler } from "../services/optimizedScheduler.js";

// POST http://localhost:5000/api/schedule/baseline
export async function baselineSchedule(req, res) {
  try {
    const result = await runBaselineScheduler();

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

// POST http://localhost:5000/api/schedule/optimize
export async function optimizedSchedule(req, res) {
  try {
    const result = await runOptimizedScheduler(30);

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}
