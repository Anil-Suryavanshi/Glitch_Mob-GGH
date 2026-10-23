# FaultForge AI — Project Overview

## 1. Executive Summary

**FaultForge AI** is an AI-powered multimodal engineering troubleshooting and education platform designed for engineering students, electronics hobbyists, makers, and STEM educators. Built for the **Google Gemini Hackathon** under the **Education & Skills** track by team **Glitch Mob** (BIT, Durg), FaultForge AI transforms how learners debug hardware-software systems.

Traditional troubleshooting tools and generic LLM chatbots offer flat, one-off lists of generic suggestions. When dealing with physical circuits (such as Arduino, ESP32, or discrete analog/digital electronics), failures stem from a complex interaction among physical wiring, component ratings, pin configurations, power rails, firmware logic, and observed environmental symptoms.

FaultForge AI addresses this fundamental challenge through an **iterative, evidence-based diagnostic workflow** powered by Google Gemini. Users submit multimodal evidence—problem descriptions, circuit photographs, firmware source code, expected behavior, and observed symptoms. Gemini analyzes the composite evidence and outputs a structured diagnostic report featuring ranked hypotheses, confidence estimates, and safe, actionable verification tests. Crucially, as learners execute tests and supply fresh observations, FaultForge AI reevaluates its hypotheses—strengthening, weakening, or eliminating them—and tracks repair outcomes to verify root-cause resolution.

---

## 2. Background and Context

Engineering education frequently suffers from a severe mentor-to-student bottleneck during laboratory and prototyping sessions. In hands-on electronics, robotics, and embedded systems courses:
- A single lab section often comprises 30–60 students with only 1 or 2 instructors or teaching assistants.
- A single misplaced breadboard jumper, an inverted LED or diode, an ungrounded sensor rail, or an unconfigured GPIO pin can halt a student's progress for hours.
- Beginners lack the systematic debugging methodology used by seasoned engineers: isolating subsystems, formulating falsifiable hypotheses, making differential measurements, and confirming root causes.
- Novice learners frequently change multiple variables simultaneously (replacing components, editing code, swapping power supplies), which obscures the actual failure mechanism and impedes learning.

Existing AI chatbots exacerbate this issue by hallucinating ungrounded fixes with unwarranted certainty, without asking for critical missing measurements or guiding the student through safe diagnostic steps.

FaultForge AI bridges this pedagogical gap by functioning as an expert troubleshooting mentor in the lab.

---

## 3. Problem Statement

### Core Challenge
How can we empower engineering students and makers to diagnose electronics and embedded-system faults by combining visual circuit evidence, firmware code, and observed symptoms, while progressively refining hypotheses through guided, safe diagnostic tests?

### Contributing Complications
1. **Multimodal Disconnect**: Visual wiring, schematic intent, code definitions, and physical observations are fragmented.
2. **Beginner Salience Blindness**: Learners cannot distinguish between critical clues (e.g., floating inputs, reversed cathode/anode, missing common ground) and irrelevant details.
3. **Premature Convergence**: Users latch onto the first suggested fix rather than methodically testing hypotheses.
4. **Lack of Loop Closure**: Standard AI assistants do not track whether a repair actually restored the system to its expected operational state.

---

## 4. Proposed Solution & Main Differentiator

FaultForge AI is **not a static Q&A chatbot**. It implements an **iterative scientific troubleshooting loop**:

```
[ Multimodal Evidence Ingestion ]
   (Code + Photo + Symptoms)
               │
               ▼
[ Gemini Multimodal Inference ]
  - Ranked Hypotheses
  - Evidence Mapping
  - Safe Diagnostic Test
               │
               ▼
[ Guided User Diagnostic Test ]
 (Safe, low-voltage verification)
               │
               ▼
[ Observation Reevaluation ]
 (Hypotheses updated: Supported / Weakened / Resolved)
               │
               ▼
[ Repair & Verification Closure ]
 (Outcome recorded & verified)
```

### Key Differentiators:
- **Evidence-Grounded Multimodal Analysis**: Interprets breadboard wiring photos side-by-side with firmware code and symptom descriptions.
- **Falsifiable Test Recommendations**: Rather than demanding the user replace parts blindly, it prescribes targeted diagnostic tests (e.g., measuring voltage drop, testing pin state via serial print, checking continuity).
- **Hypothesis State Evolution**: Maintains session history, explaining transparently *why* a hypothesis gained or lost credibility after an observation.
- **Explicit Safety Constraints**: Enforces low-voltage educational boundaries; immediately flags mains power hazards and directs users to qualified professionals.

---

## 5. Project Identity & Team

- **Project Name**: FaultForge AI
- **Hackathon**: Google Gemini Hackathon (2026)
- **Track**: Education & Skills
- **Team Name**: Glitch Mob
- **Institution**: Bhilai Institute of Technology (BIT), Durg
- **Team Members**:
  - **Yash Gurubakshani** — Team Leader & Full-Stack / AI Architect
  - **Gagan Shrivas** — Core Backend Developer & AI Integration
  - **Bijendra Chandra** — Systems & Database Developer
  - **Anil Suryavanshi** — UI/UX Designer & Frontend Engineer
- **AI Engine**: Google Gemini API via official Python SDK (`google-genai`)
- **Status**: Active Prototype / MVP Development

---

## 6. Project Scope

### In-Scope (MVP & Hackathon Deliverable)
- Low-voltage educational electronics (Arduino Uno/Nano, ESP32, Raspberry Pi Pico, standard sensors, LEDs, buzzers, switches, motor drivers).
- Multimodal submission: Text description, expected behavior, actual behavior, C++/Arduino/Python source code, and circuit image upload (JPG, PNG, WEBP up to 8MB).
- Structured JSON diagnostic output: Problem summary, ranked hypotheses, supporting evidence, confidence estimates, recommended safe tests, expected outcomes, safety notes, and follow-up inquiries.
- Interactive reevaluation: User submits diagnostic test observation; Gemini updates hypotheses with clear explanations of changes.
- Repair tracking: Recording attempted repairs and verifying expected vs. actual behavior.
- Persistent session storage in SQLite with complete history inspection.
- Modern engineering UI with dark cybernetic aesthetics, cyan/magenta status indicators, and responsive controls.

### Out-of-Scope (Future Enhancements)
- High-voltage mains AC circuits (>50V DC or >30V AC RMS) — strictly prohibited for safety.
- Automated oscilloscopes or automated bench multimeter hardware integration (relies on user-reported readings).
- Multi-user authentication, billing, enterprise role-based access control.
- Microservice clusters or distributed cloud caching.

---

## 7. Assumptions and Constraints

### Assumptions
- Users have access to standard web browsers (Chrome, Edge, Firefox) on desktop or mobile devices.
- Circuit photos are taken with reasonable focus and lighting showing key connections.
- The user operates on safe, educational low-voltage DC electronics (<24V DC).
- An active internet connection is available to reach the Google Gemini API.

### Constraints
- Google Gemini API quota and latency considerations.
- Model responses are probabilistic; confidence scores represent model uncertainty rather than calibrated laboratory statistics.
- Hardware measurements depend on honest, accurate user observations.
