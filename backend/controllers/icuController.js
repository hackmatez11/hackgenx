import { runBaselineScheduler } from "../services/icuScheduler.js";
import { sendSuccess, sendError } from "../views/icuView.js";

export async function runScheduler(req, res) {
  try {
    const result = await runBaselineScheduler();
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error.message);
  }
}
