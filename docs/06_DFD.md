# FaultForge AI — Data Flow Diagrams (DFD)

## 1. Overview of Data Flow

This document specifies the Data Flow Diagrams (DFD) for **FaultForge AI** across three levels of abstraction:
- **Level 0 (Context Diagram)**: High-level boundary view showing external entities and primary data exchanges.
- **Level 1 DFD**: Subsystem breakdown showing ingestion, AI multimodal analysis, persistence, and verification.
- **Level 2 DFD**: Detailed data flow within the iterative hypothesis reevaluation cycle.

---

## 2. External Entities, Processes, and Data Stores

### External Entities
- **User (Student / Maker / Educator)**: Submits symptoms, code, photos, test observations, and repair verification reports.
- **Google Gemini API**: External cloud AI engine providing multimodal visual/code inference and hypothesis ranking.

### Data Stores
- **D1: Diagnostic Sessions**: Stores session metadata, problem statements, and lifecycle states.
- **D2: Diagnostic Snapshots**: Stores historical iterations of ranked hypotheses, evidence, and safety notes.
- **D3: Test Observations**: Stores user-conducted test results and differential diagnostic interpretations.
- **D4: Repair Records**: Stores physical fix actions and verified operational outcomes.

---

## 3. Level 0: Context-Level DFD

```mermaid
graph TD
    User([User: Student / Maker / Educator])
    Gemini([Google Gemini API])
    System[FaultForge AI System]

    User -->|Symptoms, Code, Circuit Image| System
    User -->|Test Observations & Repair Log| System

    System -->|Structured Diagnosis & Safe Test| User
    System -->|Updated Hypotheses & Verification Status| User

    System -->|Multimodal Prompt & Image Context| Gemini
    Gemini -->|Structured JSON Diagnostics & Updates| System
```

---

## 4. Level 1: Subsystem DFD

```mermaid
graph TD
    User([User])
    Gemini([Google Gemini API])

    subgraph FaultForge_System [FaultForge AI System]
        P1[1.0 Validate & Ingest Evidence]
        P2[2.0 Orchestrate Gemini Multimodal Inference]
        P3[3.0 Format & Persist Initial Diagnosis]
        P4[4.0 Process Test Observation & Reevaluate]
        P5[5.0 Record Repair & Verification]

        D1[(D1: Diagnostic Sessions)]
        D2[(D2: Diagnostic Snapshots)]
        D3[(D3: Test Observations)]
        D4[(D4: Repair Records)]
    end

    User -->|Problem Text, Code, Image File| P1
    P1 -->|Validated Input Payload| P2
    P1 -->|Create Session Record| D1

    P2 -->|Multimodal Ingestion & Prompt| Gemini
    Gemini -->|Raw JSON Diagnostic Report| P2

    P2 -->|Structured Diagnostic Report| P3
    P3 -->|Save Snapshot Iteration 1| D2
    P3 -->|Render Ranked Cards & Recommended Test| User

    User -->|Observed Test Result| P4
    P4 -->|Fetch Previous Snapshot & Context| D2
    P4 -->|Reevaluation Prompt + Observation| Gemini
    Gemini -->|Hypothesis Updates Supported/Weakened| P4
    P4 -->|Save Observation| D3
    P4 -->|Save Snapshot Iteration N| D2
    P4 -->|Render Updated Hypotheses| User

    User -->|Repair Actions & Expected vs Actual Outcome| P5
    P5 -->|Update Verification Status| D1
    P5 -->|Save Repair Log| D4
    P5 -->|Render Final Verification Badge| User
```

---

## 5. Level 2: Diagnostic Iteration & Reevaluation DFD

```mermaid
graph TD
    User([User])
    Gemini([Google Gemini API])

    subgraph Diagnostic_Reevaluation_Cycle [2.0 Iterative Hypothesis Loop]
        P4_1[4.1 Ingest Test Observation]
        P4_2[4.2 Retrieve Session State & Prior Hypotheses]
        P4_3[4.3 Construct Differential Reasoning Prompt]
        P4_4[4.4 Invoke Gemini API Reevaluation]
        P4_5[4.5 Validate & Update Hypothesis Status]
        P4_6[4.6 Increment Snapshot Iteration]

        D1[(D1: Diagnostic Sessions)]
        D2[(D2: Diagnostic Snapshots)]
        D3[(D3: Test Observations)]
    end

    User -->|Test Result Text / Measurement| P4_1
    P4_1 -->|Session ID & Observation| P4_2
    D1 -.->|Read Session Symptoms & Code| P4_2
    D2 -.->|Read Iteration N-1 Hypotheses| P4_2

    P4_2 -->|Combined Evidence Context| P4_3
    P4_3 -->|Formatted Prompt| P4_4
    P4_4 -->|API Call| Gemini
    Gemini -->|Delta Hypotheses & Explanations| P4_4

    P4_4 -->|Raw Delta JSON| P4_5
    P4_5 -->|Record Test Observation Log| D3
    P4_5 -->|Compile New Ranked Snapshot| P4_6
    P4_6 -->|Write Snapshot Iteration N| D2
    P4_6 -->|Deliver Reevaluated Diagnosis| User
```
