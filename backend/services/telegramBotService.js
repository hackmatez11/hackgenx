import TelegramBot from 'node-telegram-bot-api';
import { processChatbotQuery } from '../controllers/chatbotController.js';

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.userSessions = new Map(); // Store user sessions for context
  }

  // Utility function to safely send messages with Markdown
  async safeSendMessage(chatId, message, options = {}) {
    try {
      if (options.parse_mode === 'Markdown') {
        return await this.bot.sendMessage(chatId, message, options);
      } else {
        return await this.bot.sendMessage(chatId, message, { ...options, parse_mode: 'Markdown' });
      }
    } catch (error) {
      if (error.message.includes('can\'t parse entities')) {
        // Fallback to plain text if Markdown parsing fails
        console.warn('Markdown parsing failed, using plain text:', error.message);
        return await this.bot.sendMessage(chatId, message.replace(/\*/g, '').replace(/`/g, '').replace(/_/g, ''));
      }
      throw error;
    }
  }

  initialize(token) {
    if (!token) {
      throw new Error('Telegram bot token is required');
    }

    this.bot = new TelegramBot(token, { polling: true });
    
    this.setupHandlers();
    console.log('Telegram bot initialized successfully');
  }

  setupHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `🏥 *MedCare Medical Assistant Bot*

Welcome! I can help you with medical queries and patient information.

*Available commands:*
/help - Show this help message
/query - Ask a medical question
/summary <token> - Get patient summary

*How to use:*
1. Simply type your medical question
2. For patient-specific queries, include your token number
3. Example: "What is my appointment status for token 12345?"

Let me know how I can assist you! 🤖`;
      
      await this.safeSendMessage(chatId, welcomeMessage);
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `🆘 *Help - MedCare Bot*

*Commands:*
• /start - Start the bot
• /help - Show this help message
• /query <your question> - Ask medical questions
• /summary <token> - Get patient medical summary

*Example queries:*
• /query What is my appointment status?
• /query Show me my lab reports for token OPD-1059
• What medications am I taking?
• When was my last visit?

*Tips:*
• Use /query for explicit questions or just type directly
• Include your token number for personalized responses
• Ask in natural language - I'll understand!
• I can help with appointments, reports, medications, and more

Need more help? Just ask! 💊`;
      
      await this.safeSendMessage(chatId, helpMessage);
    });

    // Handle /summary command
    this.bot.onText(/\/summary (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const tokenNumber = match[1];
      
      await this.handleSummaryRequest(chatId, tokenNumber);
    });

    // Handle /query command
    this.bot.onText(/\/query\s*(.*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match[1] ? match[1].trim() : '';
      
      if (!query) {
        await this.safeSendMessage(chatId, '❌ Please provide a query after /command. Example: /query What is my appointment status?');
        return;
      }
      
      await this.handleQueryRequest(chatId, query);
    });

    // Handle any text message that doesn't match commands
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      
      console.log(`📨 Received message: "${text}" from chat ${chatId}`);
      
      // Ignore commands that are already handled
      if (text.startsWith('/')) {
        console.log('⏭️ Skipping command message');
        return;
      }
      
      console.log('🔄 Processing as query...');
      await this.handleQueryRequest(chatId, text);
    });

    // Handle errors
    this.bot.on('polling_error', (error) => {
      console.error('Telegram bot polling error:', error);
    });

    console.log('Telegram bot handlers setup complete');
  }

  async handleSummaryRequest(chatId, tokenNumber) {
    try {
      // Send typing action
      await this.bot.sendChatAction(chatId, 'typing');
      
      // Create mock request object for the existing controller
      const mockReq = {
        params: { tokenNumber }
      };
      
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 404) {
              this.bot.sendMessage(chatId, `❌ Patient with token ${tokenNumber} not found.`);
            } else {
              this.bot.sendMessage(chatId, `❌ Error: ${data.error}`);
            }
          }
        }),
        json: (data) => {
          const summaryMessage = `📋 *Patient Summary - Token ${tokenNumber}*

${data.summary}

---
Data retrieved from MedCare system`;
          this.safeSendMessage(chatId, summaryMessage);
        }
      };
      
      // Call the existing controller
      await import('../controllers/chatbotController.js').then(({ getPatientSummary }) => {
        return getPatientSummary(mockReq, mockRes, () => {});
      });
      
    } catch (error) {
      console.error('Error handling summary request:', error);
      this.bot.sendMessage(chatId, '❌ Sorry, I encountered an error while fetching the patient summary. Please try again later.');
    }
  }

  async handleQueryRequest(chatId, query) {
    try {
      console.log(`🔍 Processing query: "${query}"`);
      
      // Send typing action
      await this.bot.sendChatAction(chatId, 'typing');
      
      // Extract token number from query if present
      const tokenMatch = query.match(/token\s*([A-Za-z0-9-]+)/i);
      const tokenNumber = tokenMatch ? tokenMatch[1] : null;
      
      console.log(`🎫 Extracted token: "${tokenNumber}"`);
      
      // Create mock request object for the existing controller
      const mockReq = {
        body: { 
          query: query,
          tokenNumber: tokenNumber
        }
      };
      
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`❌ Query failed with status ${code}:`, data);
            this.bot.sendMessage(chatId, `❌ Error (${code}): ${data.error}`);
          }
        }),
        json: (data) => {
          console.log(`✅ Query successful:`, data);
          const responseMessage = `🤖 *MedCare Assistant Response*

${data.response}

---
Query processed successfully${data.sql ? `\nDebug SQL: \`${data.sql}\`` : ''}`;
          this.safeSendMessage(chatId, responseMessage);
        }
      };
      
      console.log('🚀 Calling chatbot controller...');
      // Call the existing controller
      await import('../controllers/chatbotController.js').then(({ processChatbotQuery }) => {
        return processChatbotQuery(mockReq, mockRes, (error) => {
          console.error('❌ Controller error:', error);
          this.bot.sendMessage(chatId, '❌ An error occurred while processing your query.');
        });
      });
      
    } catch (error) {
      console.error('❌ Error handling query request:', error);
      this.bot.sendMessage(chatId, '❌ Sorry, I encountered an error while processing your query. Please try again later.');
    }
  }

  // Method to get bot info
  getBotInfo() {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }
    return this.bot.getMe();
  }

  // Method to stop the bot
  stop() {
    if (this.bot) {
      this.bot.stopPolling();
      console.log('Telegram bot stopped');
    }
  }
}

export default TelegramBotService;
