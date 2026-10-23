# FaultForge AI — REST API Specification

## 1. Overview and Base URL

The FaultForge AI backend exposes RESTful endpoints for health monitoring, multimodal diagnostic analysis, progressive observation reevaluation, and repair verification.

- **Base URL**: `http://127.0.0.1:8000` (or proxied via Vite frontend at `/api` and `/health`)
- **Protocol**: HTTP/1.1, JSON and Multipart/Form-Data
- **Authentication**: None required for initial educational prototype. `GEMINI_API_KEY` is securely stored on the backend.

---

## 2. Endpoints Summary

| Method | Path | Summary | Content-Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Service health status | `application/json` |
| `GET` | `/health` | Detailed service & dependency health | `application/json` |
| `POST` | `/api/diagnose` | Submit evidence & start diagnostic session | `multipart/form-data` |
| `GET` | `/api/sessions` | List historical diagnostic sessions | `application/json` |
| `GET` | `/api/sessions/{session_id}` | Retrieve complete session timeline | `application/json` |
| `POST` | `/api/sessions/{session_id}/observations` | Submit test result & reevaluate hypotheses | `application/json` |
| `POST` | `/api/sessions/{session_id}/repairs` | Log repair attempt & verification outcome | `application/json` |
| `PATCH` | `/api/sessions/{session_id}/verification`| Directly update verification status | `application/json` |

---

## 3. Endpoint Details

### 3.1 GET `/health`
Returns system operational status, database connectivity, and Gemini API configuration state.

**Response (HTTP 200)**:
```json
{
  "status": "healthy",
  "service": "FaultForge AI",
  "version": "1.0.0-MVP",
  "gemini_configured": true,
  "gemini_model": "gemini-2.5-flash",
  "database_status": "connected"
}
```

---

### 3.2 POST `/api/diagnose`
Starts a diagnostic session from user symptoms, optional expected/actual behavior, optional code, and optional circuit photo.

**Request**: `multipart/form-data`
- `symptoms` (string, required): Problem description.
- `expected_behavior` (string, optional): Desired operational behavior.
- `actual_behavior` (string, optional): Observed behavior.
- `source_code` (string, optional): Embedded sketch or script code.
- `image` (binary file, optional): Circuit photograph (JPG, PNG, WEBP, <= 8MB).

**Response (HTTP 201 Created)**:
```json
{
  "id": "b82d857d-7484-4cdc-96d7-1be4bdec5b5f",
  "title": "Arduino Uno pin 13 LED circuit does not light up",
  "symptoms": "Arduino Uno pin 13 LED circuit does not light up...",
  "expected_behavior": "LED blinks once per second at 1Hz",
  "actual_behavior": "LED stays completely dark",
  "source_code": "const int LED = 12; ...",
  "image_filename": null,
  "status": "DIAGNOSED",
  "created_at": "2026-10-23T03:50:00Z",
  "updated_at": "2026-10-23T03:50:00Z",
  "snapshots": [
    {
      "id": "c1f77d88-...",
      "session_id": "b82d857d-...",
      "iteration_number": 1,
      "summary": "Arduino digital output fails to illuminate the connected LED circuit.",
      "hypotheses": [
        {
          "id": "H1",
          "rank": 1,
          "title": "Reversed LED Polarity (Anode/Cathode Inversion)",
          "description": "The LED is connected backwards...",
          "likelihood": "HIGH",
          "confidence_score": 0.82,
          "supporting_evidence": ["LED stays dark despite pin driven HIGH"]
        }
      ],
      "recommended_test": "Safely reverse the LED orientation on the breadboard or measure DC voltage.",
      "expected_observation": "If H1 is correct, reversing LED illuminates it.",
      "additional_checks": ["Verify GND jumper wire"],
      "safety_warning": "Ensure USB power is disconnected before reseating components.",
      "follow_up_question": "What is the resistor color code?",
      "delta_explanation": "Initial diagnostic baseline generated from supplied evidence.",
      "is_demo_fallback": false,
      "created_at": "2026-10-23T03:50:00Z"
    }
  ],
  "observations": [],
  "repairs": []
}
```

---

### 3.3 POST `/api/sessions/{session_id}/observations`
Submits the empirical result of a recommended test, prompting Gemini to re-score hypotheses.

**Request Payload (`application/json`)**:
```json
{
  "user_observation": "Reversed LED legs: LED remains dark; measured 0V at Pin 13.",
  "recommended_test": "Safely reverse the LED orientation on breadboard",
  "hypothesis_id": "H1"
}
```

**Response (HTTP 200 OK)**: Returns updated session with new snapshot (Iteration 2) containing updated hypothesis ranks and `delta_explanation`.

---

### 3.4 POST `/api/sessions/{session_id}/repairs`
Records a repair attempt and its user-reported verification outcome.

**Request Payload (`application/json`)**:
```json
{
  "repair_description": "Corrected sketch pin definition from pin 12 to 13 and uploaded.",
  "expected_behavior": "LED blinks at 1Hz",
  "observed_behavior": "LED is now blinking steadily at 1Hz.",
  "verification_status": "VERIFIED_RESOLVED",
  "notes": "Verified working on breadboard."
}
```

**Response (HTTP 200 OK)**: Returns session with updated status `RESOLVED` and appended repair record.

---

## 4. Standard Error Responses

- **HTTP 400 Bad Request**: Invalid image format or file size exceeding 8MB.
  ```json
  {"detail": "Unsupported image type 'application/pdf'. Allowed: JPG, PNG, WEBP."}
  ```
- **HTTP 404 Not Found**: Session does not exist.
  ```json
  {"detail": "Diagnostic session 'unknown-id' not found."}
  ```
- **HTTP 422 Unprocessable Content**: Missing required `symptoms` field.
  ```json
  {"detail": "Symptoms / problem description is required."}
  ```
- **HTTP 429 Too Many Requests**: Gemini API quota exceeded.
  ```json
  {"detail": "Google Gemini API quota exceeded or rate-limited. Please check your quota."}
  ```
