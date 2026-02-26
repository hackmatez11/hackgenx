import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { LlmError } from "../domain/errors.js";

const priorityRuleSchemaKeys = ["id", "description", "conditions", "score", "category"];

export class GeminiLlmClient {
  constructor(apiKey = env.geminiApiKey) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async compilePolicy(policyText) {
    try {
      const model = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const systemPrompt = `
You are a hospital policy compiler.
Convert natural language bed scheduling policy into STRICT JSON with this exact shape:

{
  "name": "string",
  "versionTag": "string",
  "priorityRules": PriorityRule[],
  "categoryEligibilityRules": CategoryEligibilityRule[],
  "defaultCategory": "string"
}

PriorityRule:
{
  "id": "string",
  "description": "string",
  "conditions": Condition[],
  "score": number,
  "category": "string"
}

CategoryEligibilityRule:
{
  "id": "string",
  "category": "string",
  "conditions": Condition[]
}

Condition:
{
  "field": "string (dot path in Patient, e.g. 'age', 'severityScore', 'vitalSigns.heartRate')",
  "operator": "EQ" | "NEQ" | "GT" | "GTE" | "LT" | "LTE" | "IN" | "NOT_IN" | "EXISTS" | "MISSING",
  "value"?: any
}

Rules:
- ALWAYS return valid JSON only, no comments, no explanations.
- Do not include any additional top-level keys.
- Use numeric scores where higher means higher priority.
      `.trim();

      const result = await model.generateContent([
        {
          role: "system",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "user",
          parts: [{ text: policyText }]
        }
      ]);

      const rawText = result.response.text();
      const parsed = JSON.parse(rawText);

      this.validateCompiledPolicyShape(parsed);

      return parsed;
    } catch (err) {
      throw new LlmError(`Failed to compile policy via Gemini: ${err.message}`);
    }
  }

  validateCompiledPolicyShape(candidate) {
    if (!candidate || typeof candidate !== "object") {
      throw new LlmError("Compiled policy is not an object");
    }

    if (!Array.isArray(candidate.priorityRules) || !Array.isArray(candidate.categoryEligibilityRules)) {
      throw new LlmError("Compiled policy missing required rule arrays");
    }

    for (const rule of candidate.priorityRules) {
      for (const key of priorityRuleSchemaKeys) {
        if (!(key in rule)) {
          throw new LlmError(`PriorityRule missing required key '${key}'`);
        }
      }
      if (!Array.isArray(rule.conditions)) {
        throw new LlmError("PriorityRule.conditions must be array");
      }
    }

    for (const rule of candidate.categoryEligibilityRules) {
      if (!rule.id || !rule.category || !Array.isArray(rule.conditions)) {
        throw new LlmError("CategoryEligibilityRule missing required fields");
      }
    }

    const validateCondition = (condition) => {
      if (!condition.field || !condition.operator) {
        throw new LlmError("Condition missing field or operator");
      }
    };

    candidate.priorityRules.forEach((r) => r.conditions.forEach(validateCondition));
    candidate.categoryEligibilityRules.forEach((r) => r.conditions.forEach(validateCondition));
  }
}

