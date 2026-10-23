# FaultForge AI — Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the functional, non-functional, interface, and safety requirements for **FaultForge AI** (Version 1.0.0-MVP). It serves as the definitive reference for development, quality assurance, and mentor evaluation.

### 1.2 Intended Audience
- Engineering mentors, evaluators, and hackathon judges.
- Developers, testers, and UI/UX designers of team **Glitch Mob**.
- End users (engineering students, makers, laboratory instructors).

---

## 2. Overall System Description

### 2.1 Product Perspective
FaultForge AI operates as a modern client-server web application. The frontend (React + Tailwind CSS + Lucide Icons) interfaces via standard RESTful APIs with a backend service (FastAPI + Python + SQLAlchemy + SQLite). The backend delegates multimodal reasoning to Google Gemini using the official Python SDK (`google-genai`).

### 2.2 System Context Diagram
```
+-----------------------------------------------------------+
|                        Client Browser                     |
|  [ React UI: Evidence Input | Diagnostic View | History ] |
+-----------------------------+-----------------------------+
                              | HTTP / JSON & Multipart
                              v
+-----------------------------------------------------------+
|                     FastAPI Backend                       |
|  [ Routers | Pydantic Schemas | Session Logic | Safety ]  |
+-------------------+-------------------+-------------------+
                    |                   |
                    v                   v
          +-------------------+ +-------------------+
          |  SQLite Database  | | Google Gemini API |
          |  (SQLAlchemy ORM) | |  (google-genai)   |
          +-------------------+ +-------------------+
```

---

## 3. Functional Requirements (FR)

### FR-01: Diagnostic Session Input
- **Description**: The system shall accept a problem description, optional expected behavior, optional actual behavior, optional source code, and an optional circuit photograph.
- **Rules**: At least one meaningful textual input (symptoms, description, or code) or an image must be provided before submission is enabled.

### FR-02: Image Validation & Ingestion
- **Description**: The system shall accept image uploads in JPG, JPEG, PNG, and WEBP formats.
- **Constraints**: Enforce an upload limit of 8 MB (8,388,608 bytes).
- **Validation**: Reject unsupported MIME types or oversized files with clear, client-friendly HTTP 400 error responses.

### FR-03: Multimodal AI Diagnosis
- **Description**: The backend shall transmit both visual and textual evidence to the Google Gemini API using the official SDK.
- **Rules**: If an image is present, it shall be encoded and passed as part of the multimodal contents payload. If no image is provided, the API shall process the textual prompt alone.

### FR-04: Structured Diagnostic Output
- **Description**: The Gemini model output shall be parsed into a strict Pydantic model and returned to the client as JSON containing:
  - `problem_summary`: Concise description of the detected symptom.
  - `hypotheses`: Array of ranked hypotheses, each with `id`, `rank`, `title`, `description`, `likelihood` (High/Medium/Low), `confidence_score` (0.0 to 1.0), and `supporting_evidence` (array of strings).
  - `recommended_test`: An actionable, safe diagnostic test.
  - `expected_observation`: What the user should observe if the top hypothesis holds true.
  - `additional_checks`: Array of secondary checks.
  - `safety_warning`: Prominent electrical/operational caution.
  - `follow_up_question`: Clarification prompt for missing data.

### FR-05: Evidence-Based Reevaluation
- **Description**: The system shall allow the user to submit an observation from a performed test against an active session.
- **Rules**: The backend shall supply Gemini with the initial context, previous hypotheses, the recommended test, and the user's observed outcome. The returned updated snapshot shall indicate whether each hypothesis is `SUPPORTED`, `WEAKENED`, or `UNRESOLVED`, alongside updated confidence rankings.

### FR-06: Repair Verification
- **Description**: The system shall allow the user to record repair details:
  - `repair_description`: Changes applied to hardware or code.
  - `expected_behavior`: Intended outcome after repair.
  - `observed_behavior`: Actual outcome observed.
  - `verification_status`: Enum (`VERIFIED_RESOLVED`, `UNRESOLVED`, `INCONCLUSIVE`).

### FR-07: Diagnostic History & Persistence
- **Description**: The system shall store sessions, diagnostic snapshots, test observations, and repair records in an SQLite database.
- **Rules**: Users shall be able to list past sessions (`GET /api/sessions`) and retrieve full session timelines (`GET /api/sessions/{session_id}`). API keys must never be persisted.

### FR-08: User Interface
- **Description**: The UI shall implement a responsive, modern engineering dashboard with:
  - Dark engineering palette with neon cyan (`#00f0ff`) and magenta (`#ff007f`) accents.
  - Code editor-style input for firmware sketches.
  - Visual confidence meters and ranked hypothesis cards.
  - Test observation modal / input section.
  - Repair verification status indicator.
  - Session history sidebar or list view.

### FR-09: Robust Error Handling
- **Description**: The system shall gracefully trap and format:
  - Client validation failures (HTTP 422 / 400).
  - Gemini API authentication failures (HTTP 401 / 500 with actionable messages).
  - Gemini quota limits (HTTP 429).
  - JSON decoding errors from model output (automatic repair or fallback).
  - Database persistence exceptions.

### FR-10: Electrical & Educational Safety
- **Description**: The system shall enforce low-voltage educational parameters.
- **Rules**: Prompts and validation rules must flag mains voltages (>50V DC or >30V AC RMS) and instruct the user to seek certified professional assistance.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-01 Security**: The Google Gemini API key shall strictly reside in server-side environment variables and never be sent to the browser or checked into version control.
- **NFR-02 Reliability**: All endpoints must return consistent, schema-validated JSON responses. Unexpected model output must not cause unhandled 500 exceptions.
- **NFR-03 Usability**: The UI must be intuitive for 1st- and 2nd-year engineering students without requiring prior AI training.
- **NFR-04 Maintainability**: The codebase must be modularized into discrete routers, services, models, and schemas following standard Python and React best practices.
- **NFR-05 Performance**: Backend health and session queries must respond in < 50ms. Gemini multimodal round-trips should complete within standard model inference latency (< 8s).
- **NFR-06 Responsiveness**: The frontend must render seamlessly on viewports from 375px (mobile) to 2560px (ultra-wide desktop).
- **NFR-07 Accessibility**: Color contrast ratios for text on dark backgrounds must meet WCAG 2.1 AA standards.
- **NFR-08 Data Integrity**: Foreign key relationships between sessions, snapshots, observations, and repairs must be maintained.
- **NFR-09 Explainability**: The system must explicitly ground hypotheses in observed evidence rather than presenting opaque conclusions.
- **NFR-10 Transparency**: The UI must clarify that confidence scores are model estimates, not calibrated laboratory probabilities.

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Single Page Application (SPA) built with React and Vite.
- Responsive design supporting keyboard navigation and screen readers.

### 5.2 Software Interfaces
- Python 3.10+ runtime.
- FastAPI framework (ASGI).
- Google Gemini API (v1beta / standard endpoints via `google-genai` SDK).
- SQLite3 database engine via SQLAlchemy 2.0 ORM.

### 5.3 Communication Interfaces
- RESTful HTTP/1.1 and HTTP/2 over localhost or TLS.
- JSON payloads for API communications (`application/json`).
- `multipart/form-data` for multimodal image submissions.
