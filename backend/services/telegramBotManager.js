import TelegramBotService from "../services/telegramBotService.js";

class TelegramBotManager {
  constructor() {
    this.botService = new TelegramBotService();
    this.isInitialized = false;
  }

  async initializeBot() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!token) {
        console.warn('⚠️  TELEGRAM_BOT_TOKEN not found in environment variables');
        console.warn('   Telegram bot will not be initialized');
        console.warn('   Add your token to .env file to enable Telegram bot');
        return false;
      }

      this.botService.initialize(token);
      this.isInitialized = true;
      
      console.log('✅ Telegram bot initialized successfully');
      
      // Get bot info and log it
      const botInfo = await this.botService.getBotInfo();
      console.log(`🤖 Bot: @${botInfo.username} (${botInfo.first_name})`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error.message);
      return false;
    }
  }

  getBotService() {
    return this.botService;
  }

  isBotInitialized() {
    return this.isInitialized;
  }

  async stopBot() {
    if (this.isInitialized) {
      this.botService.stop();
      this.isInitialized = false;
      console.log('🛑 Telegram bot stopped');
    }
  }
}

// Create singleton instance
const telegramBotManager = new TelegramBotManager();

export default telegramBotManager;
