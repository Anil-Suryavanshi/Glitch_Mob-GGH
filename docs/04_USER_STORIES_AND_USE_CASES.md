# FaultForge AI — User Stories and Use Cases

## 1. User Stories

### US-01: Multimodal Problem Submission
- **As an** engineering student debugging an embedded project,
- **I want to** submit my problem symptoms, firmware code, and circuit photograph,
- **So that** the AI can analyze physical wiring and code definitions together to isolate the defect.
- **Acceptance Criteria**: Form accepts text and image (JPG/PNG/WEBP <8MB); validates required fields; submits to backend.

### US-02: Ranked Hypotheses with Evidence
- **As a** maker prototyping a sensor circuit,
- **I want to** see ranked potential causes with confidence scores and specific supporting evidence citations,
- **So that** I understand *why* a particular fault is suspected rather than receiving arbitrary guesses.
- **Acceptance Criteria**: Displays ranked cards (#1, #2, #3) with likelihood, confidence meter, and evidence tags.

### US-03: Guided Differential Diagnostic Testing
- **As a** lab student unsure of what to measure next,
- **I want to** receive a safe, step-by-step diagnostic test with expected observations,
- **So that** I can differentiate between competing hypotheses without risking damage to components.
- **Acceptance Criteria**: Recommended test describes explicit measurement (multimeter, continuity, or logic test) and expected outcome.

### US-04: Evidence-Based Hypothesis Reevaluation
- **As a** learner who just performed a diagnostic test,
- **I want to** input my observed measurement or visual result and have hypotheses updated,
- **So that** the diagnostic model adjusts its conclusions based on empirical reality.
- **Acceptance Criteria**: Submitting test results triggers a reevaluation; snapshot iteration increments; hypotheses are tagged as `SUPPORTED`, `WEAKENED`, or `UNRESOLVED` with a delta explanation.

### US-05: Repair Verification and Closure
- **As a** student who applied a circuit or code fix,
- **I want to** record my repair and verify whether the system now operates as expected,
- **So that** the troubleshooting loop is definitively closed and documented.
- **Acceptance Criteria**: Allows logging repair action, expected vs. observed post-repair behavior, and setting status to `VERIFIED_RESOLVED`.

### US-06: Session History Retrieval
- **As an** educator reviewing student laboratory progress,
- **I want to** view past troubleshooting sessions and examine the step-by-step iterations,
- **So that** I can evaluate the student's debugging methodology.
- **Acceptance Criteria**: History sidebar lists past cases with timestamps, titles, iteration counts, and resolution badges.

---

## 2. Detailed Use Cases

### Use Case UC-01: Initial Circuit Fault Diagnosis
- **Actor**: Engineering Student / Maker
- **Preconditions**:
  - Web dashboard is open at `http://127.0.0.1:5173`.
  - Backend API is online.
- **Main Flow**:
  1. User enters problem symptoms (e.g. "LED does not illuminate on pin 13").
  2. User optionally specifies expected and actual behavior.
  3. User pastes Arduino sketch or C++ code into the code box.
  4. User attaches a breadboard photograph.
  5. User clicks "Analyze Fault & Generate Ranked Diagnosis".
  6. Frontend validates inputs and dispatches `multipart/form-data` to `POST /api/diagnose`.
  7. Backend invokes Gemini multimodal reasoning and persists Iteration 1 snapshot in SQLite.
  8. Dashboard renders ranked hypotheses cards, confidence scores, and recommended test.
- **Alternative Flow A (Text-only case)**:
  - User submits without image; backend executes text-and-code inference seamlessly.
- **Alternative Flow B (Demo mode / No API key)**:
  - If `GEMINI_API_KEY` is not configured, backend returns clearly labeled demo sample data with `is_demo_fallback=true`.
- **Failure Flow**:
  - File exceeds 8MB or invalid MIME type: Client displays validation error alert without sending.

### Use Case UC-02: Diagnostic Observation Reevaluation
- **Actor**: Engineering Student / Maker
- **Preconditions**:
  - An active session with at least one diagnostic snapshot is displayed.
- **Main Flow**:
  1. User performs the recommended test (e.g., checks voltage with DMM or reverses LED).
  2. User inputs the empirical observation in the Observation Console.
  3. User clicks "Submit Observation & Update Ranks".
  4. Backend retrieves previous snapshot context and prompts Gemini for delta reevaluation.
  5. Gemini re-scores hypotheses, marking them `SUPPORTED`, `WEAKENED`, or `UNRESOLVED`.
  6. Backend stores the observation and persists Snapshot Iteration 2.
  7. Frontend displays updated hypothesis rankings and highlights the delta explanation.
- **Failure Flow**:
  - User submits empty observation: Form validation requires at least 2 characters.

### Use Case UC-03: Repair Verification & Session Archival
- **Actor**: Engineering Student / Maker
- **Preconditions**:
  - Root cause has been identified through diagnostic testing.
- **Main Flow**:
  1. User applies physical or firmware fix (e.g., corrects pin number in code).
  2. User inputs repair description and observed outcome in Repair Section.
  3. User selects "Verified Resolved".
  4. Backend updates session status to `RESOLVED` and logs the repair attempt.
  5. UI displays verified resolution badge with timestamp and summary.
