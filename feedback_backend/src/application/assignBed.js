import { z } from "zod";
import { PolicyNotFoundError, ValidationError } from "../domain/errors.js";
import { assignBed as assignBedDomain } from "../domain/scheduler.js";

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

const bedSchema = z.object({
  id: z.string(),
  category: z.string(),
  ward: z.string().optional(),
  attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

const assignBedInputSchema = z.object({
  patientData: patientSchema,
  availableBeds: z.array(bedSchema).nonempty("availableBeds must be a non-empty array")
});

export const validateAssignBedInput = (input) => {
  const parsed = assignBedInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid input for bed assignment", parsed.error.flatten());
  }
  return parsed.data;
};

export const assignBed = async (input, deps) => {
  const active = await deps.policyStore.getActivePolicy();
  if (!active) {
    throw new PolicyNotFoundError();
  }

  return assignBedDomain(input.patientData, input.availableBeds, active.compiledPolicy);
};

