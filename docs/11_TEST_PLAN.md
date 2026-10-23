# FaultForge AI — Quality Assurance & Test Plan

## 1. Test Strategy Overview

FaultForge AI utilizes a multi-layered quality assurance strategy:
1. **Unit & Schema Tests**: Validate Pydantic models, boundary constraints, and JSON parsers.
2. **API Integration Tests**: Validate FastAPI endpoints, database transactions, and error handling via `pytest` and `TestClient`.
3. **Multimodal Negative Tests**: Validate file size limits, corrupt image formats, and missing required fields.
4. **End-to-End Workflow Verification**: Validate complete multi-iteration diagnostic cycles.
5. **Frontend Production Build Verification**: Validate Vite build compilation without warnings or broken dependencies.

---

## 2. Automated Test Suite Matrix

| Test ID | Test Category | Target Component | Description | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Health Check | `GET /` & `GET /health` | Validates database connectivity, service status, and Gemini model report. | **PASSED** (0.01s) |
| **TC-02** | Schema Validation | `Hypothesis` | Validates valid hypothesis construction and enforces confidence score range [0.0, 1.0]. | **PASSED** (0.01s) |
| **TC-03** | Schema Validation | `DiagnosisReport` | Validates complete structured report schema with hypotheses list and recommended test. | **PASSED** (0.01s) |
| **TC-04** | Schema Validation | `ObservationCreate` | Enforces minimum string length constraints on user observations. | **PASSED** (0.01s) |
| **TC-05** | Schema Validation | `RepairCreate` | Validates required fields and enum verification status. | **PASSED** (0.01s) |
| **TC-06** | API Integration | `POST /api/diagnose` | Text-only diagnostic session creation with symptoms, code, and expected behavior. | **PASSED** (0.03s) |
| **TC-07** | Multimodal Image | `POST /api/diagnose` | Validates successful multipart form upload with in-memory JPEG image bytes. | **PASSED** (0.02s) |
| **TC-08** | Negative Test | `POST /api/diagnose` | Submitting empty or whitespace symptoms returns HTTP 422 Unprocessable Content. | **PASSED** (0.01s) |
| **TC-09** | Negative Test | `POST /api/diagnose` | Submitting unsupported file format (PDF) returns HTTP 400 Bad Request. | **PASSED** (0.01s) |
| **TC-10** | End-to-End | Iteration Cycle | Full sequence: Create session -> List sessions -> Submit observation -> Reevaluate hypotheses (Iter 2) -> Record repair -> Verify resolved. | **PASSED** (0.06s) |
| **TC-11** | Build Verification | Frontend Production | `vite build` creates minified bundles without syntax errors or missing native bindings. | **PASSED** (1.16s) |
| **TC-12** | Live Server E2E | Live Port 8000 & 5173 | Live HTTP request verification across running FastAPI server and SQLite storage. | **PASSED** (0.12s) |

---

## 3. Test Execution Summary

- **Test Framework**: `pytest 8.4.2` with Python 3.13.7
- **Executed Command**: `python -m pytest backend/tests/ -v`
- **Total Tests Executed**: 12
- **Passed**: 12
- **Failed**: 0
- **Warnings**: 0
- **Execution Time**: 0.38 seconds
