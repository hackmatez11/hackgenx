## Feedback Backend – Dynamic Hospital Bed Scheduling

This service is a production-grade backend for **dynamic hospital bed scheduling** built with **Node.js**, **Express**, and **TypeScript**, following **Clean Architecture** principles.

LLM (Gemini) is used **only for policy compilation**. All runtime scheduling and bed assignment is **fully deterministic** and does **not** call the LLM.

### Architecture Overview

- **Domain (`src/domain/`)**
  - `types.ts`: Core types (`Patient`, `Bed`, `CompiledPolicy`, `PriorityRule`, etc.).
  - `ruleEngine.ts`: Pure functions to evaluate compiled rules and convert them into scores and categories.
  - `scheduler.ts`: Unit-test-ready pure scheduler functions wrapping the rule engine:
    - `calculatePatientPriority(patient, policy)`
    - `assignBed(patient, beds, policy)`

- **Application (`src/application/`)**
  - `compilePolicy.ts`: Use-case to validate policy text, call Gemini, validate compiled JSON, and store with versioning.
  - `calculatePriority.ts`: Use-case to load active policy and compute a deterministic priority score.
  - `assignBed.ts`: Use-case to load active policy, compute priority, and assign a bed deterministically.

- **Infrastructure (`src/infrastructure/`)**
  - `llmClient.ts`: `GeminiLlmClient` that calls Gemini with a strict system prompt and validates JSON shape.
  - `policyStore.ts`: `PolicyStore` interface and `InMemoryPolicyStore` implementation with versioned policies and an active policy (latest).

- **Interfaces (`src/interfaces/`)**
  - `routes.ts`: Express routes (controllers) for all REST APIs. No business logic; only input validation, calling use-cases, and shaping HTTP responses.
  - `middlewares/logging.ts`: Logging middleware with structured JSON logs.
  - `middlewares/errorHandler.ts`: Global error handler that maps typed errors to HTTP status codes.

- **Config (`src/config/`)**
  - `env.ts`: Environment configuration and validation via Zod (`PORT`, `NODE_ENV`, `GEMINI_API_KEY`).

- **Server (`src/server.ts`)**
  - Express bootstrap: JSON body parsing, CORS, logging, routes under `/api`, and global error handler.

- **Examples (`src/examples/`)**
  - `exampleCompiledPolicy.json`: Example of a compiled policy that the LLM should produce.

### Environment Configuration

Create a `.env` file in `feedback_backend` with at least:

```bash
NODE_ENV=development
PORT=4001
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### Install & Run

From the `feedback_backend` directory:

```bash
npm install
npm run dev
```

The server will start on `http://localhost:4001` by default.

### REST APIs

All endpoints are prefixed with `/api`.

#### 1️⃣ Policy Compilation API – `POST /api/policy/compile`

**Input body:**

```json
{
  "policyText": "ICU beds are reserved for patients with severity >= 8 or respiratory failure. Elderly patients (65+) get priority for GENERAL beds."
}
```

**Behavior:**

- Validates input using Zod.
- Sends `policyText` to Gemini with a strict system prompt.
- Expects a **strict JSON** policy following the `CompiledPolicy` structure.
- Validates the LLM JSON shape.
- Stores the compiled policy with a generated **version ID**.

**Response:**

```json
{
  "version": "1730000000000-1"
}
```

#### 2️⃣ Get Active Policy – `GET /api/policy/active`

**Response:**

```json
{
  "version": "1730000000000-1",
  "compiledPolicy": {
    "...": "see src/examples/exampleCompiledPolicy.json for an example"
  }
}
```

Returns the latest compiled policy as the active version.

#### 3️⃣ Calculate Patient Priority – `POST /api/priority/calculate`

**Input body:**

```json
{
  "patientData": {
    "id": "patient-123",
    "age": 72,
    "severityScore": 9,
    "arrivalTime": "2025-01-01T10:30:00.000Z",
    "conditions": ["respiratory_failure"],
    "vitalSigns": {
      "heartRate": 120
    }
  }
}
```

**Response:**

```json
{
  "priorityScore": 150,
  "eligibleCategories": ["ICU", "GENERAL"]
}
```

The exact score and categories depend on the active compiled policy.

#### 4️⃣ Assign Bed – `POST /api/bed/assign`

**Input body:**

```json
{
  "patientData": {
    "id": "patient-123",
    "age": 72,
    "severityScore": 9,
    "arrivalTime": "2025-01-01T10:30:00.000Z",
    "conditions": ["respiratory_failure"],
    "vitalSigns": {
      "heartRate": 120
    }
  },
  "availableBeds": [
    {
      "id": "bed-icu-1",
      "category": "ICU",
      "ward": "ICU-A",
      "attributes": {
        "ventilator": true
      }
    },
    {
      "id": "bed-gen-1",
      "category": "GENERAL",
      "ward": "GEN-1"
    }
  ]
}
```

**Response:**

```json
{
  "assignedBedId": "bed-icu-1",
  "category": "ICU",
  "priorityScore": 150,
  "status": "ASSIGNED"
}
```

If no eligible bed is available (or no eligible categories), the response becomes:

```json
{
  "assignedBedId": null,
  "category": null,
  "priorityScore": 150,
  "status": "WAITLISTED"
}
```

### Deterministic Scheduling & Tie-Breaking

- **No randomness**: The scheduling logic is pure and deterministic.
- **Priority scoring**:
  - `CompiledPolicy.priorityRules` define numeric `score` values and `conditions`.
  - For each rule whose conditions match the patient, the score is added to a total `priorityScore`.
  - `categoryEligibilityRules` add eligible categories without modifying the score.
- **Sorting**:
  - Priority score is computed per patient (higher is better).
  - For bed assignment, beds are filtered by eligible categories and then sorted deterministically:
    - Stable ordering by `category` (lexical).
    - A deterministic weight derived from `bed.id` and `patient.arrivalTime`.
    - Fallback tie-breaker: `bed.id` lexical order.

The **unit-test-ready pure functions** are:

- `src/domain/scheduler.ts`
  - `calculatePatientPriority(patient, policy)`
  - `assignBed(patient, beds, policy)`

These functions contain no I/O and no global state.

### Example Policy Compilation Call (cURL)

```bash
curl -X POST http://localhost:4001/api/policy/compile \
  -H "Content-Type: application/json" \
  -d '{
    "policyText": "ICU beds are reserved for patients with severity >= 8 or respiratory failure. Elderly patients (65+) get priority for GENERAL beds."
  }'
```

Then load and test:

```bash
curl http://localhost:4001/api/policy/active

curl -X POST http://localhost:4001/api/priority/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "patientData": {
      "id": "patient-123",
      "age": 72,
      "severityScore": 9,
      "arrivalTime": "2025-01-01T10:30:00.000Z",
      "conditions": ["respiratory_failure"]
    }
  }'
```

### Clean Architecture Notes

- **Controllers (Express routes)**:
  - Only handle HTTP concerns: request parsing, validation, and response mapping.
  - Delegate to application use-cases (`compilePolicy`, `calculatePriority`, `assignBed`).
  - No business logic inside controllers.

- **Application layer**:
  - Coordinates domain logic and infrastructure.
  - Depends on abstractions (`PolicyStore`, `LlmClient`) rather than concrete implementations.

- **Domain layer**:
  - Contains all core business rules and pure functions (priority calculation and bed assignment).
  - No dependency on Express, LLM SDKs, or external storage.

- **Infrastructure layer**:
  - Adapters to external systems: Gemini LLM and the in-memory policy store (swappable with a real DB later).

### Error Handling & Validation

- All external inputs (policy text, patient data, available beds) are **validated via Zod**.
- Typed errors:
  - `ValidationError` → HTTP 400
  - `PolicyNotFoundError` → HTTP 404
  - Other `DomainError` → HTTP 422
  - Unhandled errors → HTTP 500
- Global error handler logs error details and returns a safe JSON payload.

