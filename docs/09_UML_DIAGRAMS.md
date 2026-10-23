# FaultForge AI — UML Diagrams

## 1. Sequence Diagram: Initial Multimodal Diagnosis

```mermaid
sequenceDiagram
    autonumber
    actor User as Engineering Student
    participant UI as React Frontend
    participant API as FastAPI Router
    participant Service as SessionService
    participant Gemini as GeminiService (Gen AI SDK)
    participant DB as SQLite DB

    User->>UI: Inputs symptoms, code, attaches photo
    User->>UI: Clicks "Analyze Fault"
    UI->>UI: Validates file type and size (<= 8MB)
    UI->>API: POST /api/diagnose (multipart/form-data)
    API->>Service: create_session(symptoms, code, image_bytes)
    Service->>DB: INSERT INTO diagnostic_sessions (status: ANALYZING)
    Service->>Gemini: diagnose_fault(prompt, image_bytes)
    Gemini->>Gemini: Multimodal reasoning (wiring + code + symptoms)
    Gemini-->>Service: Structured JSON (Ranked Hypotheses + Recommended Test)
    Service->>DB: INSERT INTO diagnosis_snapshots (Iteration 1)
    Service->>DB: UPDATE diagnostic_sessions (status: DIAGNOSED)
    Service-->>API: SessionDetailResponse
    API-->>UI: HTTP 201 Created (JSON)
    UI-->>User: Displays Ranked Cards (#1, #2, #3), Confidence, and Test Procedure
```

---

## 2. Sequence Diagram: Evidence-Based Reevaluation

```mermaid
sequenceDiagram
    autonumber
    actor User as Engineering Student
    participant UI as React Frontend
    participant API as FastAPI Router
    participant Service as SessionService
    participant Gemini as GeminiService
    participant DB as SQLite DB

    User->>UI: Inputs observed test result (e.g. "0V at pin 13")
    User->>UI: Clicks "Submit Observation & Update Ranks"
    UI->>API: POST /api/sessions/{id}/observations
    API->>Service: submit_observation(session_id, observation_payload)
    Service->>DB: INSERT INTO test_observations
    Service->>DB: SELECT previous snapshot hypotheses & context
    Service->>Gemini: reevaluate_hypotheses(context, prior_hypotheses, observation)
    Gemini-->>Service: Updated Hypotheses (Supported / Weakened) + Delta Explanation
    Service->>DB: INSERT INTO diagnosis_snapshots (Iteration 2)
    Service->>DB: UPDATE diagnostic_sessions (status: REEVALUATED)
    Service-->>API: SessionDetailResponse
    API-->>UI: HTTP 200 OK (JSON)
    UI-->>User: Renders updated rankings, delta explanation, and next test
```

---

## 3. Activity Diagram: Repair Verification Workflow

```mermaid
stateDiagram-v2
    [*] --> FormulateHypothesis
    FormulateHypothesis --> RecommendTest: Initial Diagnosis
    RecommendTest --> ConductTest: User Performs Safe Test
    ConductTest --> ReportObservation: Empirical Data Collected
    ReportObservation --> ReevaluateHypotheses: Gemini Re-scores
    ReevaluateHypotheses --> RootCauseIsolated: Is Root Cause Confirmed?
    RootCauseIsolated --> RecommendTest: No (Next Test Needed)
    RootCauseIsolated --> ApplyRepair: Yes (Fix Hardware / Code)
    ApplyRepair --> TestRepairedSystem: Power up safely
    TestRepairedSystem --> RecordVerification: User checks expected behavior
    RecordVerification --> VerifiedResolved: Status = VERIFIED_RESOLVED
    RecordVerification --> Unresolved: Status = UNRESOLVED
    VerifiedResolved --> [*]: Session Archived
    Unresolved --> FormulateHypothesis: Re-diagnose
```

---

## 4. Deployment Diagram

```mermaid
graph TD
    subgraph Client_Device [User Client Device: PC / Laptop / Tablet]
        Browser[Modern Web Browser Chrome / Edge / Firefox]
        ReactApp[FaultForge React SPA :5173]
        Browser --- ReactApp
    end

    subgraph Host_Server [Local Host / Server Environment]
        Uvicorn[Uvicorn ASGI Server :8000]
        FastAPIApp[FastAPI Application Backend]
        SQLiteFile[(faultforge.db SQLite Database)]

        Uvicorn --- FastAPIApp
        FastAPIApp --- SQLiteFile
    end

    subgraph Google_Cloud [Google AI Cloud Infrastructure]
        GeminiAPI[Google Gemini API Endpoint]
    end

    ReactApp -->|HTTP REST / JSON / Multipart| Uvicorn
    FastAPIApp -->|HTTPS / google-genai SDK| GeminiAPI
```
