import { z } from "zod";
import { PolicyNotFoundError, ValidationError } from "../domain/errors.js";
import { calculatePatientPriority } from "../domain/scheduler.js";

const patientSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  age: z.number().int().positive().optional(),
  severityScore: z.number().optional(),
  arrivalTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "arrivalTime must be a valid ISO date string"
  }),
  conditions: z.array(z.string()).optional(),
  vitalSigns: z.record(z.union([z.number(), z.string()])).optional(),
  metadata: z.record(z.unknown()).optional()
});

const calculatePriorityInputSchema = z.object({
  patientData: patientSchema
});

export const validateCalculatePriorityInput = (input) => {
  const parsed = calculatePriorityInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid patient input for priority calculation", parsed.error.flatten());
  }
  return parsed.data;
};

export const calculatePriority = async (input, deps) => {
  const active = await deps.policyStore.getActivePolicy();
  if (!active) {
    throw new PolicyNotFoundError();
  }

  return calculatePatientPriority(input.patientData, active.compiledPolicy);
};

