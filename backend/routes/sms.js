import express from "express";
import { sendSMS } from "../controllers/smsController.js";

const router = express.Router();

// POST /api/sms/send
router.post("/send", sendSMS);

export default router;
