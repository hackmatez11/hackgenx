# Telegram Bot Integration for MedCare

This document explains how to set up and use the Telegram bot integration for the MedCare medical chatbot system.

## 🚀 Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/start` to begin
3. Send `/newbot` to create a new bot
4. Follow the prompts to name your bot (e.g., "MedCare Assistant")
5. Choose a username (must end with `bot`, e.g., "MedCareAssistantBot")
6. Copy the **bot token** provided by BotFather

### 2. Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your Telegram bot token to the `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
   ```

### 3. Start the Server

```bash
cd backend
npm start
```

The Telegram bot will automatically initialize when the server starts.

## 🤖 Bot Commands

### Basic Commands
- `/start` - Welcome message and introduction
- `/help` - Show help information and available commands
- `/summary <token>` - Get patient medical summary for specific token

### Natural Language Queries
Users can simply type questions in natural language:
- "What is my appointment status?"
- "Show me my lab reports for token 12345"
- "What medications am I taking?"
- "When was my last visit?"

The bot will automatically extract token numbers from queries if provided.

## 📡 API Endpoints

The following endpoints are available for managing the Telegram bot:

### POST `/api/telegram/initialize`
Manually initialize the bot with a token
```json
{
  "token": "your-bot-token"
}
```

### GET `/api/telegram/info`
Get bot information
```json
{
  "success": true,
  "data": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "MedCare Assistant",
    "username": "MedCareAssistantBot"
  }
}
```

### POST `/api/telegram/stop`
Stop the bot polling

### GET `/api/telegram/health`
Check if the Telegram service is running

## 🔧 Features

### ✅ What the Bot Can Do
- Answer medical queries using natural language processing
- Provide patient summaries with token numbers
- Handle appointment status inquiries
- Access lab reports and test results
- Show medication information
- Process bed allocation queries
- Generate SQL queries from natural language

### 🛡️ Safety Features
- Input validation and error handling
- Graceful fallback for failed queries
- Typing indicators for better UX
- Markdown formatting for readable responses
- Comprehensive error messages

## 🔄 Integration Details

The Telegram bot integrates with the existing chatbot system by:
1. Reusing the same `chatbotController.js` logic
2. Leveraging Gemini AI for natural language processing
3. Using Supabase for data retrieval
4. Maintaining the same query processing pipeline

## 🐛 Troubleshooting

### Bot Not Responding
1. Check if the bot token is correct in `.env`
2. Verify the server is running without errors
3. Check console logs for initialization messages
4. Ensure the bot token has proper permissions

### Common Issues
- **"TELEGRAM_BOT_TOKEN not found"**: Add token to `.env` file
- **"Bot not initialized"**: Check token validity and network connection
- **"Polling error"**: May be network issues, bot will retry automatically

### Logs
Monitor the console for these messages:
- `✅ Telegram bot initialized successfully`
- `🤖 Bot: @YourBotName (Bot Name)`
- `🚀 Telegram bot is ready to receive messages`

## 📱 User Experience

When users interact with the bot:
1. They receive immediate typing indicators
2. Responses are formatted with Markdown for readability
3. Error messages are user-friendly and helpful
4. Commands are case-insensitive
5. Natural language is preferred over rigid commands

## 🔒 Security Considerations

- Bot tokens are stored in environment variables
- Input validation prevents injection attacks
- Error messages don't expose sensitive information
- Database queries are parameterized

## 📈 Monitoring

Use the health endpoint to monitor bot status:
```bash
curl http://localhost:5000/api/telegram/health
```

This will return the service status and timestamp.
