# FaultForge AI — System Architecture

## 1. Architectural Overview

FaultForge AI employs a clean, modular three-tier client-server architecture designed for high maintainability, rapid developer feedback, and testability.

```
+─────────────────────────────────────────────────────────────+
|                    PRESENTATION TIER                        |
|                                                             |
|   React (Vite) + Tailwind CSS + Lucide Icons + Fetch API    |
|   - Evidence Submission Form (Text, Code, Image Upload)     |
|   - Structured Diagnosis Viewer (Ranked Cards, Confidence)  |
|   - Interactive Test Observation & Reevaluation Console     |
|   - Repair Verification & Session History Panel             |
+──────────────────────────────▲──────────────────────────────+
                               │ HTTP / REST (JSON / Multipart)
+──────────────────────────────▼──────────────────────────────+
|                    APPLICATION & AI TIER                    |
|                                                             |
|   FastAPI Application (Python 3.13)                         |
|   - Router Layer (/api/health, /api/diagnose, /api/sessions)|
|   - Pydantic Validation & Schema Enforcement                |
|   - Session & Workflow Engine                               |
|   - Gemini AI Service Layer (google-genai SDK)              |
|   - Safety Guardrails & Model Response Sanitizer            |
+──────────────────────▲──────────────────────▲───────────────+
                       │                      │
                       ▼                      ▼
+─────────────────────────────+  +────────────────────────────+
|      PERSISTENCE TIER       |  |      EXTERNAL AI TIER      |
|                             |  |                            |
|   SQLite + SQLAlchemy 2.0   |  |   Google Gemini API        |
|   - DiagnosticSession       |  |   - Multimodal Reasoning   |
|   - DiagnosisSnapshot       |  |   - Hypothesis Generation  |
|   - TestObservation         |  |   - Evidence Reevaluation  |
|   - RepairAttempt           |  |   - JSON Mode Enforcement  |
+─────────────────────────────+  +────────────────────────────+
```

---

## 2. Component Responsibilities

### 2.1 Frontend (Presentation Layer)
- **Evidence Collector**: Validates file types and sizes (<8MB) before sending.
- **Diagnostic Renderer**: Renders ranked cards, likelihood badges, confidence progress bars, and evidence tags.
- **Interactive Feedback Console**: Allows the user to select the recommended test, report their observation, and trigger reevaluation.
- **Verification Flow**: Records the physical repair attempt and confirms if the circuit behaves as expected.
- **Session History Browser**: Enables recalling previous debugging sessions.

### 2.2 Backend (Application & AI Layer)
- **FastAPI Core (`main.py`)**: Configures CORS middleware, registers routers, and sets up exception handlers.
- **Diagnostic Router (`diagnostic.py`)**: Handles `/api/diagnose`, `/api/sessions`, `/api/sessions/{id}/observations`, and `/api/sessions/{id}/repairs`.
- **Gemini Service (`gemini_service.py`)**:
  - Initializes the Google Gen AI client with the configured model (default: `gemini-2.5-flash` or `gemini-1.5-flash`).
  - Prepares multimodal prompts (text instructions + PIL image).
  - Enforces JSON output schema using Gemini's native structured generation capabilities.
  - Implements fallback error wrapping and demo mode fallbacks when credentials are intentionally absent.
- **Safety Module**: Validates that neither prompts nor sketches suggest hazardous mains operations.

### 2.3 Persistence Layer
- **SQLAlchemy Engine & Models (`models.py`)**: Defines relational tables with foreign keys and cascade rules.
- **SQLite Database (`faultforge.db`)**: Zero-configuration, zero-dependency, local ACID-compliant storage.

---

## 3. Technology Choices & Rationale

| Layer | Technology | Choice Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | Blazing-fast hot module replacement (HMR), lightweight build, component-driven UI. |
| **Styling** | Tailwind CSS | Rapid, consistent styling with dark theme, neon cybernetic accents, and responsive utilities. |
| **Icons** | Lucide React | Modern, clean iconography for engineering indicators (circuits, chips, meters, alerts). |
| **Backend Framework** | FastAPI (Python) | High-performance async support, automatic OpenAPI/Swagger documentation, native Pydantic validation. |
| **AI SDK** | `google-genai` | The official next-generation Google Gen AI Python SDK, supporting the latest multimodal models and JSON schemas. |
| **Persistence** | SQLite + SQLAlchemy 2.0 | Zero external infrastructure needed; self-contained, completely reproducible across all mentor environments. |

---

## 4. End-to-End Request Lifecycle

### Initial Diagnosis Flow
1. **User Action**: The user fills in symptoms and uploads a circuit image, clicking "Analyze Fault".
2. **Client Validation**: The frontend checks that file size is <= 8MB and format is JPG/PNG/WEBP.
3. **HTTP Dispatch**: Form data is sent as `multipart/form-data` to `POST /api/diagnose`.
4. **Backend Ingestion**: FastAPI reads the fields and image bytes; creates a `DiagnosticSession` record with status `ANALYZING`.
5. **AI Invocation**: `gemini_service.diagnose_fault()` bundles the prompt, system instructions, and image bytes, invoking `client.models.generate_content()`.
6. **Schema Enforcement**: Raw Gemini JSON output is parsed by `DiagnosisReportSchema`.
7. **Persistence**: A `DiagnosisSnapshot` (Iteration 1) is created in SQLite linked to the session.
8. **Response Delivery**: The validated structured diagnosis is returned as HTTP 200 to the frontend.
9. **UI Render**: The dashboard renders hypotheses, likelihoods, evidence, and the recommended test.

---

## 5. Security Boundaries

- **Secret Isolation**: `GEMINI_API_KEY` is loaded strictly on the backend via `python-dotenv`. It is never returned in HTTP responses.
- **Untrusted Input Treatment**: User text and code are treated as untrusted data and wrapped with strict system delimiters in Gemini prompts to prevent prompt injection.
- **File Upload Protection**: Image bytes are checked via magic bytes / Pillow before processing; files are processed in-memory and not executed on the server.
- **CORS Configuration**: Restricts access to localhost origins during development.

---

## 6. Deployment & Execution Model

The application runs as two lightweight local processes:
1. **Backend**: `uvicorn app.main:app --reload --port 8000`
2. **Frontend**: `npm run dev -- --port 5173`
Reverse proxy or unified static serving is also supported by building the Vite bundle and serving via FastAPI.
