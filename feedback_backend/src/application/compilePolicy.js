import { z } from "zod";
import { ValidationError } from "../domain/errors.js";

const compilePolicyInputSchema = z.object({
  policyText: z.string().min(1, "policyText is required")
});

export const validateCompilePolicyInput = (input) => {
  const parsed = compilePolicyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid compile policy input", parsed.error.flatten());
  }
  return parsed.data;
};

export const compilePolicy = async (input, deps) => {
  const compiledPolicy = await deps.llmClient.compilePolicy(input.policyText);
  const versionRecord = await deps.policyStore.savePolicy(compiledPolicy);

  return {
    version: versionRecord.version,
    compiledPolicy: versionRecord.compiledPolicy
  };
};

