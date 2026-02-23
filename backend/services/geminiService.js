import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { APP_CONSTANTS } from "../config/constants.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  }

  async generateSQLQuery(userQuery, tokenNumber = null) {
    try {
      const prompt = this.buildPrompt(userQuery, tokenNumber);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract SQL query from response
      return this.extractSQL(text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate SQL query");
    }
  }

  async generateNaturalLanguageResponse(data, userQuery) {
    try {
      // Handle empty or null data
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return "No results found for your query. Please check the token number or try a different query.";
      }

      const prompt = `
        User Query: ${userQuery}
        Database Results: ${JSON.stringify(data, null, 2)}
        
        Based on the database results above, provide a helpful and concise natural language response.
        If no data found, politely inform the user.
        Format the response in a user-friendly way.
        Keep the response clear and professional.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Validate response
      if (!text || text.trim().length === 0) {
        return this.formatFallbackResponse(data, userQuery);
      }
      
      return text;
    } catch (error) {
      console.error("Gemini API Error generating response:", error);
      // Return formatted data instead of generic error
      return this.formatFallbackResponse(data, userQuery);
    }
  }

  formatFallbackResponse(data, userQuery) {
    try {
      // Provide a basic formatted response when Gemini fails
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return "No results found for your query.";
      }

      if (Array.isArray(data)) {
        if (data.length === 1) {
          const item = data[0];
          const fields = Object.entries(item)
            .filter(([key, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          return `Found 1 result:\n\n${fields}`;
        } else {
          return `Found ${data.length} results:\n\n${JSON.stringify(data, null, 2)}`;
        }
      }

      return `Result:\n\n${JSON.stringify(data, null, 2)}`;
    } catch (error) {
      console.error("Error formatting fallback response:", error);
      return "Query executed successfully. Please check the data in the response.";
    }
  }

  buildPrompt(userQuery, tokenNumber) {
    let prompt = APP_CONSTANTS.SYSTEM_PROMPT;

    if (tokenNumber) {
      prompt += `\n\nThe patient's token number is: ${tokenNumber}`;
    }

    prompt += `\n\nUser Query: ${userQuery}\nSQL:`;

    return prompt;
  }

  extractSQL(text) {
    // Extract SQL from markdown code blocks if present
    const sqlRegex = /```sql\n([\s\S]*?)\n```/;
    const match = text.match(sqlRegex);

    if (match) {
      return match[1].trim();
    }

    // If no code block, assume the whole response is SQL
    return text.trim();
  }
}
