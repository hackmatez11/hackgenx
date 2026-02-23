import express from "express";
import TelegramBotService from "../services/telegramBotService.js";

const router = express.Router();
const telegramBotService = new TelegramBotService();

// Initialize Telegram bot
router.post("/initialize", (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: "Telegram bot token is required" 
      });
    }
    
    telegramBotService.initialize(token);
    
    res.json({ 
      success: true, 
      message: "Telegram bot initialized successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get bot info
router.get("/info", async (req, res) => {
  try {
    const botInfo = await telegramBotService.getBotInfo();
    res.json({ 
      success: true, 
      data: botInfo 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Stop bot
router.post("/stop", (req, res) => {
  try {
    telegramBotService.stop();
    res.json({ 
      success: true, 
      message: "Telegram bot stopped successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Telegram bot service is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
