# FaultForge AI — Mentor Review Demonstration Script

## 1. Demo Objectives

The purpose of this demonstration is to prove that **FaultForge AI** delivers an **iterative, evidence-grounded engineering diagnostic workflow** rather than functioning as a standard conversational chatbot.

---

## 2. Rehearsed Demo Scenario: Arduino LED Circuit Failure

### The Engineering Problem:
An engineering student builds a simple circuit with an Arduino Uno, a breadboard, an LED, and a 220-ohm resistor. Upon powering the Arduino via USB, the green power LED is lit, but the LED fails to blink.

The learner is confused because they don't know whether the LED is backwards, the resistor is wrong, the jumper is loose, or their code pin definition doesn't match their physical wiring.

---

## 3. Step-by-Step Demonstration Flow

### Step 1: System Health & Architecture Tour (1 Minute)
- **Action**: Open `http://127.0.0.1:5173`. Point out the header indicators:
  - Backend: `Online` (Connected to SQLite).
  - AI Engine: `Gemini 2.5` (or explicit `Demo Mode` if offline).
  - Hackathon & Team identity: `Glitch Mob (BIT Durg)`.
- **Talking Point**:
  > *"Notice how the system immediately establishes confidence by checking server health and AI readiness. The architecture separates the React presentation tier from our FastAPI AI orchestration engine."*

### Step 2: 1-Click Evidence Ingestion (1.5 Minutes)
- **Action**: Click the **"Load Arduino LED Demo"** button on the form.
  - Show how the symptoms, expected/actual behavior, and Arduino sketch are pre-filled.
  - Point out the sketch code: `const int LED_PIN = 12;` while the physical circuit is wired to Pin 13.
- **Action**: Click **"Analyze Fault & Generate Ranked Diagnosis"**.
- **Talking Point**:
  > *"Instead of guessing random fixes, Gemini analyzes the code definition alongside physical circuit constraints. It parses the evidence into a strict JSON schema."*

### Step 3: Diagnostic Report & Safe Test (1.5 Minutes)
- **Action**: Highlight the structured output:
  - Ranked Hypotheses:
    - #1: Reversed LED Polarity (Anode/Cathode Inversion).
    - #2: Software Pin Mismatch or Missing pinMode(OUTPUT).
    - #3: Incorrect Resistor Value.
  - Confidence meters and evidence breakdown.
  - **Recommended Test**: *"Safely reverse the LED orientation on the breadboard or measure DC voltage between Pin 13 and GND."*
- **Talking Point**:
  > *"Here is the first major differentiator: FaultForge AI doesn't tell the user to blindly buy a new board. It prescribes a safe, targeted test to differentiate between hypothesis #1 and #2."*

### Step 4: Iterative Reevaluation Loop (2 Minutes)
- **Action**: In the observation console, click the preset:
  - *"Reversed LED legs: Still dark, 0V measured at Pin 13."*
- **Action**: Click **"Submit Observation & Update Ranks"**.
- **Show Outcome**:
  - The snapshot advances to **Iteration 2**.
  - The **Delta Explanation Banner** appears: Explaining that reversing the LED failed and voltage reads 0V, which weakens hypothesis #1 and strongly supports hypothesis #2 (software pin mismatch).
  - Hypothesis #2 jumps to Rank #1 with status **SUPPORTED** (92% confidence).
- **Talking Point**:
  > *"This is the core innovation: the AI updates its reasoning based on empirical measurements reported by the user, closing the scientific debugging loop."*

### Step 5: Repair Verification Closure (1 Minute)
- **Action**: Scroll to the Repair Section. Click **"Pre-fill Arduino Pin Fix"**:
  - Repair: *"Updated pinMode and digitalWrite pin from 12 to 13."*
  - Observed: *"LED now blinks at 1Hz."*
  - Select: **Verified Resolved**.
- **Action**: Click **"Record Verification Status"**.
- **Show Outcome**:
  - The system marks the session as **Verified Resolved** with an emerald banner.
  - Open the **History Drawer** to show the archived session with full iteration history.

---

## 4. Likely Mentor Questions & Honest Answers

### Q1: *"Is the AI actually measuring voltages itself?"*
**Answer**:
> *"No, sir. FaultForge AI does not simulate fake hardware probes. It guides the student on what physical measurement to make with their bench multimeter, and relies on user-reported empirical data. This preserves academic integrity and teaches real laboratory skills."*

### Q2: *"How do you handle Gemini API quota limits or outages?"*
**Answer**:
> *"We built an explicit, transparent demo fallback mode that labels sample data clearly without pretending to reach the cloud. When a valid API key is present, it executes live multimodal reasoning with Gemini 2.5."*

### Q3: *"How is this different from asking ChatGPT?"*
**Answer**:
> *"ChatGPT gives static text walls and forgets prior state when users try to isolate variables. FaultForge AI maintains a normalized database of hypothesis iterations, enforces structured JSON, guides safe testing, and tracks repair verification."*
