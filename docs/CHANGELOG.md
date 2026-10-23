# Changelog — FaultForge AI

All notable changes to the FaultForge AI project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-MVP] — 2026-10-23

### Added
- **Multimodal Evidence Ingestion**:
  - Problem symptoms, expected behavior, actual behavior, embedded firmware code editor, and circuit photograph upload (JPG, PNG, WEBP <= 8MB).
  - Client-side image preview and validation.
- **AI Diagnostic Engine**:
  - Integration with the official `google-genai` Python SDK supporting `gemini-2.5-flash` and `gemini-1.5-flash`.
  - Strict Pydantic JSON schema enforcement (`DiagnosisReport`, `Hypothesis`).
  - Transparent demo fallback mode when API keys are not yet configured.
- **Iterative Hypothesis Reevaluation**:
  - Test observation submission endpoint (`POST /api/sessions/{id}/observations`).
  - Delta explanation generating transparent shifts (`SUPPORTED`, `WEAKENED`, `UNRESOLVED`).
  - Multi-iteration snapshot tracking.
- **Repair Verification & Closure**:
  - Repair action logging (`POST /api/sessions/{id}/repairs`).
  - Verification statuses: `VERIFIED_RESOLVED`, `UNRESOLVED`, `INCONCLUSIVE`.
  - Celebratory resolution banner and timeline recording.
- **Persistence & History**:
  - SQLite database (`faultforge.db`) with SQLAlchemy ORM models.
  - Session history sidebar with quick session recall.
- **Design & UI**:
  - Cybernetic dark engineering theme with neon cyan (`#00f0ff`) and magenta (`#ff007f`) accents.
  - Animated confidence progress bars and likelihood indicators.
  - "Load Arduino LED Demo" 1-click mentor evaluation button.
- **Automated Quality Assurance**:
  - 12 comprehensive `pytest` backend unit, negative, and integration tests (0.38s execution).
  - Frontend production build verification (`vite build` completed in 1.16s).
- **Comprehensive Documentation Package**:
  - 17 structured engineering specification and design documents in `docs/`.
