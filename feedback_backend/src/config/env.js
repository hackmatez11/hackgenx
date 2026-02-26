import dotenv from "dotenv";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

// Resolve project roots so we can load env from:
// - feedback_backend/.env (if present)
// - project root .env
// - backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "../../../");

// Load env files in a safe order (later calls do not override existing vars)
dotenv.config({ path: path.join(projectRoot, ".env") }); // root .env
dotenv.config({ path: path.join(projectRoot, "backend/.env") }); // backend .env
dotenv.config(); // local cwd .env as fallback

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // PORT is optional – defaults to 4001 if not provided
  PORT: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number(val)) &&
          Number(val) > 0 &&
          Number.isInteger(Number(val))),
      {
        message: "PORT must be a positive integer"
      }
    ),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration", parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: Number(process.env.PORT) || 4001,
  geminiApiKey: parsed.data.GEMINI_API_KEY
};

