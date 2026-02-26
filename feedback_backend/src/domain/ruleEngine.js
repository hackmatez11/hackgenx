import { ValidationError } from "./errors.js";

const getValueByPath = (obj, path) => {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
};

const evaluateCondition = (patient, condition) => {
  if (!condition || typeof condition !== "object") {
    throw new ValidationError("Invalid condition object in compiled policy");
  }

  const actual = getValueByPath(patient, condition.field);
  const expected = condition.value;

  switch (condition.operator) {
    case "EXISTS":
      return actual !== undefined && actual !== null;
    case "MISSING":
      return actual === undefined || actual === null;
    case "EQ":
      return actual === expected;
    case "NEQ":
      return actual !== expected;
    case "GT":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "GTE":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "LT":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "LTE":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "IN":
      return Array.isArray(expected) && expected.includes(actual);
    case "NOT_IN":
      return Array.isArray(expected) && !expected.includes(actual);
    default:
      throw new ValidationError(`Unsupported operator in compiled policy: ${String(condition.operator)}`);
  }
};

const matchesAllConditions = (patient, conditions) =>
  Array.isArray(conditions) && conditions.every((cond) => evaluateCondition(patient, cond));

export const calculatePriorityFromPolicy = (patient, policy) => {
  let totalScore = 0;
  const eligibleCategoriesSet = new Set();

  for (const rule of policy.priorityRules || []) {
    if (matchesAllConditions(patient, rule.conditions)) {
      totalScore += Number.isFinite(rule.score) ? rule.score : 0;
      if (rule.category) {
        eligibleCategoriesSet.add(rule.category);
      }
    }
  }

  for (const rule of policy.categoryEligibilityRules || []) {
    if (matchesAllConditions(patient, rule.conditions) && rule.category) {
      eligibleCategoriesSet.add(rule.category);
    }
  }

  const eligibleCategories = Array.from(eligibleCategoriesSet);

  return {
    priorityScore: totalScore,
    eligibleCategories
  };
};

export const assignBedDeterministically = (patient, beds, policy) => {
  const { priorityScore, eligibleCategories } = calculatePriorityFromPolicy(patient, policy);

  if (!Array.isArray(beds) || beds.length === 0 || eligibleCategories.length === 0) {
    return {
      assignedBedId: null,
      category: null,
      priorityScore,
      status: "WAITLISTED"
    };
  }

  const patientArrival = new Date(patient.arrivalTime).getTime();

  const eligibleBeds = beds.filter((bed) => eligibleCategories.includes(bed.category));

  if (eligibleBeds.length === 0) {
    return {
      assignedBedId: null,
      category: null,
      priorityScore,
      status: "WAITLISTED"
    };
  }

  const sortedBeds = [...eligibleBeds].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }

    const weightForBed = (bedId) => {
      const hash = Array.from(String(bedId)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      return (hash + patientArrival) % 1000;
    };

    const weightA = weightForBed(a.id);
    const weightB = weightForBed(b.id);

    if (weightA !== weightB) {
      return weightB - weightA;
    }

    return String(a.id).localeCompare(String(b.id));
  });

  const chosenBed = sortedBeds[0];

  return {
    assignedBedId: chosenBed.id,
    category: chosenBed.category,
    priorityScore,
    status: "ASSIGNED"
  };
};

