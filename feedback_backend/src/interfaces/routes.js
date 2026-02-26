import { Router } from "express";

const router = Router();

// Dummy responses – no LLM or policy store; for API client testing only.

const DUMMY_COMPILED_POLICY = {
  name: "Dummy Policy",
  versionTag: "v1-dummy",
  priorityRules: [
    {
      id: "high_severity",
      description: "High severity ICU",
      conditions: [{ field: "severityScore", operator: "GTE", value: 8 }],
      score: 100,
      category: "ICU"
    }
  ],
  categoryEligibilityRules: [
    {
      id: "general",
      category: "GENERAL",
      conditions: [{ field: "age", operator: "GTE", value: 18 }]
    }
  ],
  defaultCategory: "GENERAL"
};

router.post("/policy/compile", (req, res) => {
  res.status(201).json({ version: "dummy-version-1" });
});

router.get("/policy/active", (req, res) => {
  res.json({
    version: "dummy-version-1",
    compiledPolicy: DUMMY_COMPILED_POLICY
  });
});

router.post("/priority/calculate", (req, res) => {
  res.json({
    priorityScore: 85,
    eligibleCategories: ["ICU", "GENERAL"]
  });
});

router.post("/bed/assign", (req, res) => {
  res.json({
    assignedBedId: "bed-icu-1",
    category: "ICU",
    priorityScore: 85,
    status: "ASSIGNED"
  });
});

export default router;
