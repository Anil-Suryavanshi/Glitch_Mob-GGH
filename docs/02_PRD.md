# FaultForge AI — Product Requirements Document (PRD)

## 1. Product Vision

FaultForge AI is an interactive, intelligent engineering diagnostic partner that empowers makers, students, and educators to master practical electronics troubleshooting. By synthesizing visual circuit evidence, firmware source code, and observed physical behaviors through Google Gemini, FaultForge AI provides a rigorous, pedagogical scientific debugging workflow rather than guessing arbitrary solutions.

---

## 2. Target User Personas

### Persona 1: "Lab Student Leo" (Beginner Engineering Student)
- **Background**: 2nd-year undergraduate in Electrical or Computer Engineering.
- **Goal**: Complete lab assignments and semester embedded projects on time with deep comprehension.
- **Pain Point**: Spends 3 hours stuck because an LED is backwards or a pull-up resistor is missing; generic internet searches recommend modifying unrelated code libraries.
- **Needs**: Clear instructions on what to probe with a digital multimeter or serial monitor; clear explanations of what physical evidence points to which root cause.

### Persona 2: "Hobbyist Priya" (Maker / IoT Prototyper)
- **Background**: Self-taught maker building smart home sensors with ESP32/Arduino.
- **Goal**: Quickly isolate why a sensor intermittently returns NaN or drops off I2C bus.
- **Pain Point**: Changing 5 variables at once makes debugging chaotic and frustrating.
- **Needs**: Systematic hypothesis elimination and repair verification tracking.

### Persona 3: "Prof. Sharma" (STEM / Electronics Educator)
- **Background**: Laboratory instructor managing 40 students simultaneously.
- **Goal**: Foster autonomous problem-solving and systematic scientific methods in students.
- **Pain Point**: Answering the exact same basic wiring questions repeatedly while advanced students wait for assistance.
- **Needs**: A trusted tool that enforces safety and teaches the troubleshooting method rather than simply giving away quick answers.

---

## 3. User Problems & Value Proposition

| User Problem | Existing Solutions / Limitations | FaultForge AI Value Proposition |
| :--- | :--- | :--- |
| Fragmented Evidence (wiring vs code vs symptoms) | User pastes code into ChatGPT; bot cannot see physical breadboard wiring errors. | Multimodal ingestion (analyzes circuit photo alongside code and symptoms). |
| Hallucinated or Generic Fixes | LLMs suggest replacing microcontrollers or rebuilding from scratch. | Formulates ranked, falsifiable hypotheses with supporting evidence citations. |
| No Guided Testing | User does not know which measurement distinguishes cause A from cause B. | Recommends safe, minimal tests with precise expected observations. |
| Lost Debugging Context | User tries 4 different fixes, forgets what worked, and repeats mistakes. | Persistent session history with iterative hypothesis reevaluation and repair verification. |

---

## 4. User Journeys

### Journey A: Initial Multimodal Diagnosis
1. User navigates to the FaultForge AI web dashboard.
2. User enters problem summary (e.g., "Arduino Uno LED on Pin 13 doesn't light up").
3. User specifies expected behavior ("LED should blink at 1Hz") and actual behavior ("LED remains dark continuously").
4. User uploads a clear photo of the breadboard and Arduino.
5. User pastes the `.ino` / C++ sketch.
6. User clicks **"Analyze Fault"**.
7. System processes evidence through Gemini and presents:
   - Ranked hypotheses (e.g., reversed polarity, incorrect pin mapping, missing ground wire).
   - Confidence estimate.
   - Evidence citing specific wires, code lines, or symptoms.
   - Recommended test: "Measure DC voltage between Pin 13 and GND with multimeter or swap LED orientation."

### Journey B: Iterative Hypothesis Reevaluation
1. User runs the recommended test and notes the result: "Swapped LED legs, but LED still stays dark. Pin 13 reads 0V."
2. User submits this observation under the active session.
3. FaultForge AI calls Gemini reevaluation:
   - Weakens "reversed polarity" hypothesis.
   - Strengthens "software pin definition mismatch" or "pin configuration mode" hypothesis.
   - Recommends next test: "Check `pinMode(13, OUTPUT)` in `setup()`."

### Journey C: Repair Verification & Closure
1. User notices `pinMode(12, OUTPUT)` was written instead of 13 in code, fixes it, and uploads the new sketch.
2. User records repair: "Updated pin assignment from 12 to 13."
3. User verifies outcome: "LED now blinks as expected."
4. Status marks **"Verified Resolved"**, archiving the troubleshooting session for future reference.

---

## 5. MoSCoW Feature Prioritization

### Must Have (MVP — Mentor Review Ready)
- [x] Input form for problem description, expected vs. actual behavior, and code.
- [x] Image upload (JPG, PNG, WEBP, up to 8MB) with client-side preview and size validation.
- [x] Google Gemini multimodal integration using the official SDK (`google-genai`).
- [x] Strict structured JSON output schema for diagnostic reports.
- [x] Interactive UI displaying ranked hypotheses, confidence meters, evidence tags, and recommended safe tests.
- [x] Low-voltage safety enforcement and prominent safety alerts.
- [x] Graceful error handling for missing keys, quota limits, and malformed inputs.
- [x] Responsive dark engineering dashboard UI.

### Should Have (Next-Priority / MVP Completion)
- [x] Interactive test observation submission with hypothesis reevaluation.
- [x] Visual diff / explanation of hypothesis changes (Supported / Weakened / Unresolved).
- [x] Repair attempt logging and repair verification status tracking.
- [x] SQLite session persistence and session history navigation.
- [x] Comprehensive automated test suite (`pytest`) and frontend production build verification.

### Could Have (Post-Hackathon Roadmap)
- [ ] Direct WebSerial integration to read Arduino Serial Monitor logs in real time.
- [ ] Schematic netlist (KiCad / Fritzing) parser.
- [ ] Voice input for hands-free lab operation.
- [ ] Multi-language localization for global engineering students.

### Won't Have (Deliberately Excluded)
- [ ] High-voltage mains analysis (strictly prohibited due to safety risks).
- [ ] User authentication / payment gateway / complex cloud microservices.
- [ ] Automated circuit synthesis or hardware simulation engines.

---

## 6. MVP Acceptance Criteria

1. **System Startup**:
   - Backend boots cleanly with `uvicorn` and responds to `GET /health` with `status: "healthy"`.
   - Frontend compiles and runs via Vite on standard localhost port.
2. **Diagnostic Pipeline**:
   - Submitting an Arduino LED fault scenario with or without an image produces a valid diagnostic report in under 8 seconds (subject to Gemini network latency).
   - Structured JSON response contains at least one ranked hypothesis, confidence estimate, evidence breakdown, and safe diagnostic test.
3. **Observation & Reevaluation**:
   - Submitting a test observation updates the diagnostic snapshot and stores the observation in SQLite.
4. **Repair Verification**:
   - User can mark a session as Verified Resolved, Unresolved, or Inconclusive with notes.
5. **Security & Secrets**:
   - No API keys are leaked to client-side bundles or frontend network payloads.

---

## 7. Success Metrics & KPIs

- **Diagnostic Speed**: Median time to initial diagnosis < 6 seconds.
- **Parsing Reliability**: 100% structured JSON compliance with zero uncaught schema crashes.
- **Safety Compliance**: 100% detection and warning issuance for any user mention of mains voltage or lithium battery shorting.
- **Pedagogical Efficacy**: User is directed to a physical or code test rather than encouraged to blindly swap hardware.

---

## 8. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| Gemini API quota exhaustion or network drop | High | Medium | Implement robust error handling, user-friendly alerts, and explicit demo fallback with clear sample data labeling. |
| User uploads oversized or corrupted image | Medium | Medium | Client-side and server-side MIME type and 8MB file size validation. |
| Unstructured or truncated LLM output | High | Low | Enforce Gemini JSON mode (`response_mime_type="application/json"`), Pydantic validation, and schema fallbacks. |
| Hallucinated dangerous instructions | Critical | Low | Strict system instructions enforcing low-voltage safety and forbidding mains wire probing. |
