import { calculatePriorityFromPolicy, assignBedDeterministically } from "./ruleEngine.js";

export const calculatePatientPriority = (patient, policy) => {
  return calculatePriorityFromPolicy(patient, policy);
};

export const assignBed = (patient, beds, policy) => {
  return assignBedDeterministically(patient, beds, policy);
};

