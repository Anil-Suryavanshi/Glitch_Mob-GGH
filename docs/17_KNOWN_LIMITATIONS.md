# FaultForge AI — Known Limitations and Technical Boundaries

## 1. Implemented Capabilities (MVP v1.0)

- Full multimodal evidence ingestion (text symptoms, expected vs actual behavior, code box, image upload up to 8MB).
- Strict structured JSON response generation via Google Gemini SDK.
- Ranked fault hypotheses with likelihood levels, confidence progress meters, and supporting evidence citations.
- Targeted, safe diagnostic test recommendation and expected outcome formulation.
- Interactive user observation submission and hypothesis reevaluation loop (Iteration 1 -> Iteration N).
- Hypothesis delta explanations highlighting which causes were `SUPPORTED`, `WEAKENED`, or `UNRESOLVED`.
- Repair attempt logging and repair verification status tracking (`VERIFIED_RESOLVED`).
- SQLite persistence of all sessions, snapshots, observations, and repairs.
- Session history drawer allowing instant retrieval and inspection of past debugging cases.
- Transparent demo fallback mode when no API key is configured.

---

## 2. Technical Limitations & Boundaries

### 2.1 Optical & Photographic Resolution Limits
- Breadboard photographs taken with blurry focus, low contrast, or obstructed jumper wiring may limit the model's ability to discern microscopic pin headers or resistor color codes.
- **Mitigation**: The system explicitly notes missing visual evidence and prompts the user for clarification in the `follow_up_question` field.

### 2.2 Reliance on User-Reported Measurements
- FaultForge AI does not physically measure voltages, currents, or waveform frequencies. It relies on the user reporting honest multimeter readings or serial monitor outputs.
- **Educational Impact**: This is an intentional pedagogical choice to build genuine laboratory competence rather than replacing physical tools.

### 2.3 Single-User Local Scope
- The current MVP runs on localhost and uses a local SQLite database (`faultforge.db`). It does not incorporate multi-tenant cloud authentication or multi-user access control.

### 2.4 High-Voltage Exclusion
- Circuits operating above 50V DC or 30V AC RMS are strictly out of scope due to safety risks.

---

## 3. Planned Improvements

- **WebSerial Oscilloscope Integration**: Direct browser-to-Arduino USB communication for automated serial telemetry and logic probing.
- **Schematic Netlist Cross-Checking**: Automated comparison between KiCad/Eagle netlists and physical breadboard wiring photos.
- **Multilingual Laboratory Mode**: Supporting Hindi, Spanish, and other regional languages for STEM students worldwide.
